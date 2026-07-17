/* GoodDay 鮮魚共有 — 02-api （自動分割・window共有） */
var {
  useState,
  useEffect,
  useCallback,
  useRef
} = React;

// ═══════════ API：Supabase読み書き層（全DB操作はここ経由） ═══════════
const SB_URL = "https://pxstuticccflzqoqvfvx.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4c3R1dGljY2NmbHpxb3F2ZnZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODM0MzEsImV4cCI6MjA5MzQ1OTQzMX0.NQjAkqpa04d6Kx0DTYfaAgahtiHJ2iXbjVyspFc9cS0";
const h = (extra = {}) => ({
  "apikey": SB_KEY,
  "Authorization": `Bearer ${SB_KEY}`,
  ...extra
});

// 取得する列を明示（select=* をやめて転送量を抑える）。pops の全カラム＝UIで使う分だけ。
const POP_COLS = "id,store_name,product_name,category,comment,author,image_url,created_at,likes,archived,genre,comment_count,used_count,is_pinned,view_count";
// 1回の取得上限（投稿が増えても重くならないための安全弁）。アーカイブ運用していれば公開中はこの数に収まる。
const POP_LIMIT = 500;

// 照合に成功したパスワードを用途別にメモリ保持（危険操作RPCに添える。ページを閉じると消える）
const PW_CACHE = {};

// 共通fetch：REST/RPCの定型（headers・エラー処理）を1箇所に集約。
// body があれば JSON 化、prefer は Prefer ヘッダー（"return=representation" 等）。
async function sbFetch(path, {
  method = "GET",
  body,
  prefer,
  headers = {}
} = {}) {
  const extra = {
    ...(body !== undefined ? {
      "Content-Type": "application/json"
    } : {}),
    ...(prefer ? {
      "Prefer": prefer
    } : {}),
    ...headers
  };
  const r = await fetch(`${SB_URL}${path}`, {
    method,
    headers: h(extra),
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  if (!r.ok) throw new Error(await r.text());
  return r;
}
const sbJson = async (path, opts) => (await sbFetch(path, opts)).json(); // 配列/JSONを返す
const sbOne = async (path, opts) => (await sbJson(path, opts))[0]; // 先頭1件を返す

// ── 端末判定：User-Agentから機種・ブラウザを大まかに分類（個人特定はしない）──
function parseDeviceUA(ua) {
  ua = ua || "";
  let platform = "その他";
  if (/iPad/.test(ua)) platform = "iPad";else if (/iPhone/.test(ua)) platform = "iPhone";else if (/Android/.test(ua)) platform = "Android";else if (/Windows|Macintosh|Linux/.test(ua)) platform = "PC";
  let browser = "その他";
  if (/CriOS/.test(ua)) browser = "Chrome";else if (/FxiOS/.test(ua)) browser = "Firefox";else if (/EdgiOS|Edg\//.test(ua)) browser = "Edge";else if (/Chrome/.test(ua) && !/Edg\//.test(ua)) browser = "Chrome";else if (/Firefox/.test(ua)) browser = "Firefox";else if (/Safari/.test(ua)) browser = "Safari";
  return {
    platform,
    browser
  };
}
const api = {
  // ── 端末記録：同じ端末からは1日1回だけ記録（localStorageで判定）。個人は特定しない。
  async logDeviceVisit(storeName) {
    try {
      const day = new Date().toISOString().slice(0, 10);
      const key = `deviceLogged:${day}`;
      if (localStorage.getItem(key)) return false;
      const {
        platform,
        browser
      } = parseDeviceUA(navigator.userAgent);
      await sbFetch(`/rest/v1/device_visits`, {
        method: "POST",
        body: {
          platform,
          browser,
          store_name: storeName || null
        }
      });
      localStorage.setItem(key, "1");
      // 古い日の記録キーは掃除
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && k.startsWith("deviceLogged:") && k !== key) localStorage.removeItem(k);
        }
      } catch (e) {}
      return true;
    } catch (e) {
      return false;
    }
  },
  async listDeviceVisits(limit = 500) {
    return sbJson(`/rest/v1/device_visits?select=platform,browser,store_name,created_at&order=created_at.desc&limit=${limit}`);
  },
  // ── pops：一覧・投稿・状態 ──
  async list(store, cat) {
    let q = `/rest/v1/pops?select=*&order=created_at.desc`;
    if (store) q += `&store_name=eq.${encodeURIComponent(store)}`;
    if (cat) q += `&category=eq.${encodeURIComponent(cat)}`;
    return sbJson(q);
  },
  async listAll() {
    return sbJson(`/rest/v1/pops?select=${POP_COLS}&order=created_at.desc`);
  },
  // 公開中のみ（掲示板・検索用）。アーカイブ済みはサーバー側で除外し、件数も上限つき。
  async listActive() {
    return sbJson(`/rest/v1/pops?select=${POP_COLS}&archived=eq.false&order=created_at.desc&limit=${POP_LIMIT}`);
  },
  // アーカイブ済みのみ（アーカイブタブ用）。
  async listArchived() {
    return sbJson(`/rest/v1/pops?select=${POP_COLS}&archived=eq.true&order=created_at.desc&limit=${POP_LIMIT}`);
  },
  async insert(data) {
    return sbOne(`/rest/v1/pops`, {
      method: "POST",
      body: data,
      prefer: "return=representation"
    });
  },
  // POPのジャンルを設定（管理画面の選別用）。genre は文字列 or null（未分類）。
  async setGenre(id, genre) {
    await sbFetch(`/rest/v1/rpc/admin_set_genre`, {
      method: "POST",
      body: {
        p_id: id,
        p_genre: genre,
        p_password: PW_CACHE.admin || ""
      }
    });
  },
  async setArchivedMany(ids, archived) {
    if (!ids.length) return;
    await sbFetch(`/rest/v1/rpc/admin_set_archived`, {
      method: "POST",
      body: {
        p_ids: ids,
        p_archived: archived,
        p_password: PW_CACHE.admin || ""
      }
    });
  },
  async del(id) {
    await sbFetch(`/rest/v1/rpc/delete_pop_secure`, {
      method: "POST",
      body: {
        p_id: id,
        p_password: PW_CACHE.delete || ""
      }
    });
  },
  async like(id, current) {
    return sbOne(`/rest/v1/rpc/increment_pop_likes`, {
      method: "POST",
      body: {
        p_id: id
      }
    });
  },
  async markUsed(id, current) {
    return sbOne(`/rest/v1/rpc/increment_pop_used`, {
      method: "POST",
      body: {
        p_id: id
      }
    });
  },
  // 閲覧数：同じ端末からは3時間に1回だけカウント（localStorageで判定）
  async addView(id) {
    try {
      const bucket = Math.floor(Date.now() / (3 * 3600 * 1000)); // 3時間ごとの区切り
      const key = `seenPop:${id}:${bucket}`;
      if (localStorage.getItem(key)) return false;
      // 古い区切りの記録は掃除（localStorageの肥大防止）
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && k.startsWith("seenPop:") && !k.endsWith(":" + bucket)) localStorage.removeItem(k);
        }
      } catch (e) {}
      localStorage.setItem(key, "1");
      await sbFetch(`/rest/v1/rpc/increment_pop_view`, {
        method: "POST",
        body: {
          p_id: id
        }
      });
      return true;
    } catch (e) {
      return false;
    }
  },
  async setPinned(popId) {
    // 全POPのis_pinnedを1回のRPCで切替（旧実装は全件PATCHでN回通信だった）
    await sbFetch(`/rest/v1/rpc/admin_set_pinned`, {
      method: "POST",
      body: {
        p_id: popId,
        p_password: PW_CACHE.admin || ""
      }
    });
    return {
      pinned_id: popId
    };
  },
  // ── pop_requests：ポップ依頼 ──
  async listRequests() {
    return sbJson(`/rest/v1/pop_requests?select=*&order=created_at.desc`);
  },
  async insertRequest(data) {
    return sbOne(`/rest/v1/pop_requests`, {
      method: "POST",
      body: data,
      prefer: "return=representation"
    });
  },
  async updateRequest(id, patch) {
    await sbFetch(`/rest/v1/pop_requests?id=eq.${id}`, {
      method: "PATCH",
      body: patch,
      prefer: "return=minimal"
    });
  },
  async delRequest(id) {
    await sbFetch(`/rest/v1/pop_requests?id=eq.${id}`, {
      method: "DELETE"
    });
  },
  // ── storage：画像アップロード（JSONでないため個別実装） ──
  async upload(file) {
    const blob = await new Promise(res => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        const max = 1200;
        let w = img.width,
          wh = img.height;
        if (w > max) {
          wh = Math.round(wh * max / w);
          w = max;
        }
        c.width = w;
        c.height = wh;
        c.getContext("2d").drawImage(img, 0, 0, w, wh);
        c.toBlob(res, "image/jpeg", 0.85);
      };
      img.src = URL.createObjectURL(file);
    });
    const name = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
    const r = await fetch(`${SB_URL}/storage/v1/object/pop-images/${name}`, {
      method: "POST",
      headers: {
        ...h(),
        "Content-Type": "image/jpeg",
        "x-upsert": "true"
      },
      body: blob
    });
    if (!r.ok) throw new Error(await r.text());
    return `${SB_URL}/storage/v1/object/public/pop-images/${name}`;
  },
  async uploadRaw(file) {
    const safe = (file.name || "file").replace(/[^\w.\-]+/g, "_");
    const name = `preset_${Date.now()}_${Math.random().toString(36).slice(2)}_${safe}`;
    const r = await fetch(`${SB_URL}/storage/v1/object/pop-images/${name}`, {
      method: "POST",
      headers: {
        ...h(),
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "true"
      },
      body: file
    });
    if (!r.ok) throw new Error(await r.text());
    return `${SB_URL}/storage/v1/object/public/pop-images/${name}`;
  },
  // ── blog_posts ──
  async listPosts() {
    return sbJson(`/rest/v1/blog_posts?select=*&order=created_at.desc`);
  },
  async insertPost(data) {
    return sbOne(`/rest/v1/blog_posts`, {
      method: "POST",
      body: data,
      prefer: "return=representation"
    });
  },
  async incrementViews(id, currentViews) {
    return sbOne(`/rest/v1/blog_posts?id=eq.${id}`, {
      method: "PATCH",
      body: {
        views: (currentViews || 0) + 1
      },
      prefer: "return=representation"
    });
  },
  async delPost(id) {
    await sbFetch(`/rest/v1/blog_posts?id=eq.${id}`, {
      method: "DELETE"
    });
  },
  // ── pop_comments ──
  async listComments(popId) {
    return sbJson(`/rest/v1/pop_comments?pop_id=eq.${popId}&order=created_at.asc&select=*`);
  },
  async addComment(popId, storeName, comment) {
    return sbOne(`/rest/v1/pop_comments`, {
      method: "POST",
      body: {
        pop_id: popId,
        store_name: storeName,
        comment
      },
      prefer: "return=representation"
    });
  },
  async listCommentedPopIds() {
    const data = await sbJson(`/rest/v1/pop_comments?select=pop_id`);
    return new Set(data.map(c => c.pop_id));
  },
  // ── floor_photos：売場写真 ──
  async listFloorPhotos(store, cat) {
    let q = `/rest/v1/floor_photos?select=*&order=created_at.desc`;
    if (store) q += `&store_name=eq.${encodeURIComponent(store)}`;
    if (cat) q += `&category=eq.${encodeURIComponent(cat)}`;
    return sbJson(q);
  },
  async insertFloorPhoto(data) {
    return sbOne(`/rest/v1/floor_photos`, {
      method: "POST",
      body: data,
      prefer: "return=representation"
    });
  },
  async delFloorPhoto(id) {
    await sbFetch(`/rest/v1/rpc/delete_floor_photo_secure`, {
      method: "POST",
      body: {
        p_id: id,
        p_password: PW_CACHE.delete || ""
      }
    });
  },
  // ── rpc：パスワード照合（Supabase側で判定。生のパスワードはHTMLに持たない） ──
  async verifyPassword(purpose, password) {
    const v = await sbJson(`/rest/v1/rpc/verify_password`, {
      method: "POST",
      body: {
        p_purpose: purpose,
        p_password: password
      }
    });
    if (v === true) PW_CACHE[purpose] = password;
    return v === true;
  },
  // ── tray_presets：包材・トレーのカテゴリ（プリセット） ──
  async listTrayPresets() {
    return sbJson(`/rest/v1/tray_presets?select=*&order=sort_order.asc`);
  },
  async createTrayPreset(name, sort_order) {
    return sbOne(`/rest/v1/tray_presets`, {
      method: "POST",
      body: {
        name,
        sort_order,
        items: []
      },
      prefer: "return=representation"
    });
  },
  async updateTrayPreset(id, patch) {
    await sbFetch(`/rest/v1/tray_presets?id=eq.${id}`, {
      method: "PATCH",
      body: patch,
      prefer: "return=minimal"
    });
  },
  async deleteTrayPreset(id) {
    await sbFetch(`/rest/v1/tray_presets?id=eq.${id}`, {
      method: "DELETE"
    });
  },
  // ── prompt_library：プロンプト記録集 ──
  async listPrompts() {
    return sbJson(`/rest/v1/prompt_library?select=*&order=created_at.desc`);
  },
  async insertPrompt(data) {
    return sbOne(`/rest/v1/prompt_library`, {
      method: "POST",
      body: data,
      prefer: "return=representation"
    });
  },
  async delPrompt(id) {
    await sbFetch(`/rest/v1/prompt_library?id=eq.${id}`, {
      method: "DELETE"
    });
  },
  // ── shared_tray_presets：発注バーコードの共有プリセット ──
  async listSharedPresets() {
    return sbJson(`/rest/v1/shared_tray_presets?select=*&order=sort_order.asc,created_at.asc`);
  },
  async insertSharedPreset(data) {
    return sbOne(`/rest/v1/shared_tray_presets`, {
      method: "POST",
      body: data,
      prefer: "return=representation"
    });
  },
  async delSharedPreset(id) {
    await sbFetch(`/rest/v1/shared_tray_presets?id=eq.${id}`, {
      method: "DELETE"
    });
  },
  // ── site_notice：一時お知らせ／機能停止バナー（全店共有） ──
  async getNotice() {
    const rows = await sbJson(`/rest/v1/site_notice?id=eq.1&select=enabled,message,tip_enabled,tip_message,feat_enabled,feat_message,feat_tab,feat_ver,updated_at`);
    return rows[0] || {
      enabled: false,
      message: "",
      tip_enabled: false,
      tip_message: "季節のポップや時期が過ぎたポップは「アーカイブ」に収納されます。",
      feat_enabled: false,
      feat_message: "",
      feat_tab: "",
      feat_ver: ""
    };
  },
  async updateNotice(patch) {
    return sbOne(`/rest/v1/rpc/admin_update_notice`, {
      method: "POST",
      body: {
        p_patch: patch,
        p_password: PW_CACHE.admin || ""
      }
    });
  },
  // ── production_notes：生産メモ ──
  async getMemo() {
    try {
      const d = await sbJson(`/rest/v1/production_notes?id=eq.1&select=*`);
      return d.length > 0 ? d[0] : {
        id: 1,
        text: ""
      };
    } catch (e) {
      return {
        id: 1,
        text: ""
      };
    } // 取得失敗時は空メモ（従来挙動を踏襲）
  },
  async saveMemo(text) {
    const result = await sbJson(`/rest/v1/production_notes?id=eq.1`, {
      method: "PATCH",
      body: {
        text,
        updated_at: new Date().toISOString()
      },
      prefer: "return=representation"
    });
    return result.length > 0 ? result[0] : {
      id: 1,
      text
    };
  }
};
;
Object.assign(window, {
  POP_COLS,
  POP_LIMIT,
  PW_CACHE,
  SB_KEY,
  SB_URL,
  api,
  h,
  sbFetch,
  sbJson,
  sbOne
});