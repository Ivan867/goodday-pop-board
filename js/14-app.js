/* Nexus共有 — 14-app （自動分割・window共有） */
var {
  useState,
  useEffect,
  useCallback,
  useRef
} = React;

// ═══════════ APP：シェル（ルーティング・ナビ・メニュー・テーマ） ═══════════
// 遅延タブの対応表：タブkey → { ファイル名, window上のコンポーネント名 }
var LAZY_TABS = {
  barcode: {
    file: "08-tab-barcode",
    comp: "BarcodeTab"
  },
  gne: {
    file: "10-tab-gne",
    comp: "GeneratorTab"
  },
  fish: {
    file: "15-tab-fish",
    comp: "FishTab"
  },
  admin: {
    file: "13-tab-admin",
    comp: "AdminTab"
  },
  request: {
    file: "13-tab-admin",
    comp: "RequestTab"
  },
  // お問い合わせ（管理ファイル内のため遅延経由で）
  archive: {
    file: "13-tab-admin",
    comp: "ArchiveTab"
  },
  // アーカイブ（同上）
  trend: {
    file: "16-tab-trend",
    comp: "TrendTab"
  },
  // トレンド（訴求の切り口）
  idea: {
    file: "17-tab-idea",
    comp: "IdeaTab"
  },
  // アイデア（一覧には出さない）
  order: {
    file: "18-tab-support",
    comp: "SupportTab"
  },
  // 店舗支援（画像の置き場）
  scan: {
    file: "19-tab-scan",
    comp: "ScanTab"
  },
  // 読み込みシステム（伝票PDF補正の手順）
  check: {
    file: "20-tab-check",
    comp: "CheckTab"
  },
  // 伝票検算（試作）
  lab: {
    file: "21-tab-lab",
    comp: "LabTab"
  },
  // 試作システム（読み込み＋伝票検算）
  guide: {
    file: "22-tab-guide",
    comp: "GuideTab"
  } // 手引き（渡すリンクと使い方）
};

// 遅延タブの器：まだ読めていなければ読み込み、ロード中はスピナー、失敗時は再試行
// メニューの線画アイコン（濃紺で統一）
const MENU_ICON = (() => {
  const P = (d, extra) => /*#__PURE__*/React.createElement("svg", {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, d, extra);
  return {
    search: P(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "7"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M20 20l-3.7-3.7"
    }))),
    bundle: P(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "5",
      width: "18",
      height: "16",
      rx: "2.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 10h18M8 3v4M16 3v4"
    }))),
    tool: P(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M12 20h9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"
    }))),
    request: P(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M4 5.5h16v13H4z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M4 7l8 6 8-6"
    }))),
    order: P(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M4 10v9.5a1 1 0 001 1h14a1 1 0 001-1V10"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 9.5L4.6 4h14.8L21 9.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 9.5h18"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9.5 20.5v-5.5h5v5.5"
    }))),
    // 店舗支援（2026-10-10 鍵→店）
    barcode: P(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M3.5 5.5v13M7 5.5v13M10.5 5.5v13M14 5.5v13M17.5 5.5v13M21 5.5v13"
    }))),
    catalog: P(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M3 5.5s2.5-1.5 4.5-1.5S12 5.5 12 5.5v14s-2-1.5-4.5-1.5S3 19.5 3 19.5z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 5.5s2.5-1.5 4.5-1.5S21 5.5 21 5.5v14s-2-1.5-4.5-1.5S12 19.5 12 19.5z"
    }))),
    lab: P(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M9.5 3v6.2L4.8 17a2 2 0 001.7 3h11a2 2 0 001.7-3l-4.7-7.8V3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M8.5 3h7M8 14h8"
    }))),
    check: P(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M4 16.5L14.5 6l3.5 3.5L7.5 20H4z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M13 7.5l3.5 3.5M4 20h16"
    }))),
    scan: P(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M5 4.5h9l5 5v10H5z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14 4.5v5h5M8 13h8M8 16.5h5"
    }))),
    shiokan: P(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3.5",
      y: "7",
      width: "17",
      height: "13",
      rx: "1.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3.5 11h17M9 7V4.5h6V7"
    }))),
    gne: P(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "4.5",
      width: "18",
      height: "15",
      rx: "2.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M7 9.5h6M7 14h10"
    }))),
    archive: P(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "4",
      width: "18",
      height: "5",
      rx: "1.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M5 9v9.5a1.5 1.5 0 001.5 1.5h11a1.5 1.5 0 001.5-1.5V9M10 13h4"
    }))),
    guide: P(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M4 5.5A2 2 0 016 3.5h13v15H6a2 2 0 00-2 2z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M8 8h7M8 11.5h7"
    }))),
    // 管理画面：3つの歯車（2026-10-10 いただいた絵に合わせて描き直し。濃い歯車は濃紺の上で見えるよう明るくした）
    admin: /*#__PURE__*/React.createElement("svg", {
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      "aria-hidden": "true",
      className: "ic-gears"
    }, /*#__PURE__*/React.createElement("path", {
      fillRule: "evenodd",
      fill: "#A9B8F5",
      d: "M12.50 7.99 L14.01 8.59 L13.23 10.45 L11.75 9.79 L10.36 11.17 L10.36 11.17 L11.01 12.65 L9.14 13.42 L8.56 11.91 L6.61 11.90 L6.61 11.90 L6.01 13.41 L4.15 12.63 L4.81 11.15 L3.43 9.76 L3.43 9.76 L1.95 10.41 L1.18 8.54 L2.69 7.96 L2.70 6.01 L2.70 6.01 L1.19 5.41 L1.97 3.55 L3.45 4.21 L4.84 2.83 L4.84 2.83 L4.19 1.35 L6.06 0.58 L6.64 2.09 L8.59 2.10 L8.59 2.10 L9.19 0.59 L11.05 1.37 L10.39 2.85 L11.77 4.24 L11.77 4.24 L13.25 3.59 L14.02 5.46 L12.51 6.04 L12.50 7.99Z M9.90 7.00 A2.3 2.3 0 1 0 5.30 7.00 A2.3 2.3 0 1 0 9.90 7.00Z"
    }), /*#__PURE__*/React.createElement("path", {
      fillRule: "evenodd",
      fill: "#EAF1F8",
      d: "M22.40 10.20 L23.50 10.40 L23.22 11.78 L22.13 11.54 L21.37 12.67 L21.37 12.67 L22.01 13.59 L20.84 14.37 L20.24 13.43 L18.90 13.70 L18.90 13.70 L18.70 14.80 L17.32 14.52 L17.56 13.43 L16.43 12.67 L16.43 12.67 L15.51 13.31 L14.73 12.14 L15.67 11.54 L15.40 10.20 L15.40 10.20 L14.30 10.00 L14.58 8.62 L15.67 8.86 L16.43 7.73 L16.43 7.73 L15.79 6.81 L16.96 6.03 L17.56 6.97 L18.90 6.70 L18.90 6.70 L19.10 5.60 L20.48 5.88 L20.24 6.97 L21.37 7.73 L21.37 7.73 L22.29 7.09 L23.07 8.26 L22.13 8.86 L22.40 10.20Z M20.50 10.20 A1.6 1.6 0 1 0 17.30 10.20 A1.6 1.6 0 1 0 20.50 10.20Z"
    }), /*#__PURE__*/React.createElement("path", {
      fillRule: "evenodd",
      fill: "#2E8FE0",
      d: "M15.91 19.05 L17.31 19.85 L16.30 21.52 L14.94 20.65 L13.42 21.75 L13.42 21.75 L13.85 23.31 L11.95 23.78 L11.60 22.20 L9.75 21.91 L9.75 21.91 L8.95 23.31 L7.28 22.30 L8.15 20.94 L7.05 19.42 L7.05 19.42 L5.49 19.85 L5.02 17.95 L6.60 17.60 L6.89 15.75 L6.89 15.75 L5.49 14.95 L6.50 13.28 L7.86 14.15 L9.38 13.05 L9.38 13.05 L8.95 11.49 L10.85 11.02 L11.20 12.60 L13.05 12.89 L13.05 12.89 L13.85 11.49 L15.52 12.50 L14.65 13.86 L15.75 15.38 L15.75 15.38 L17.31 14.95 L17.78 16.85 L16.20 17.20 L15.91 19.05Z M13.60 17.40 A2.2 2.2 0 1 0 9.20 17.40 A2.2 2.2 0 1 0 13.60 17.40Z"
    })),
    // 右の柱の1列ナビ用：同じ3つの歯車を、まわりのアイコンと同じ1色で（濃さだけ変えて奥行きを出す）
    adminMono: /*#__PURE__*/React.createElement("svg", {
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("path", {
      fillRule: "evenodd",
      fill: "currentColor",
      fillOpacity: ".55",
      d: "M12.50 7.99 L14.01 8.59 L13.23 10.45 L11.75 9.79 L10.36 11.17 L10.36 11.17 L11.01 12.65 L9.14 13.42 L8.56 11.91 L6.61 11.90 L6.61 11.90 L6.01 13.41 L4.15 12.63 L4.81 11.15 L3.43 9.76 L3.43 9.76 L1.95 10.41 L1.18 8.54 L2.69 7.96 L2.70 6.01 L2.70 6.01 L1.19 5.41 L1.97 3.55 L3.45 4.21 L4.84 2.83 L4.84 2.83 L4.19 1.35 L6.06 0.58 L6.64 2.09 L8.59 2.10 L8.59 2.10 L9.19 0.59 L11.05 1.37 L10.39 2.85 L11.77 4.24 L11.77 4.24 L13.25 3.59 L14.02 5.46 L12.51 6.04 L12.50 7.99Z M9.90 7.00 A2.3 2.3 0 1 0 5.30 7.00 A2.3 2.3 0 1 0 9.90 7.00Z"
    }), /*#__PURE__*/React.createElement("path", {
      fillRule: "evenodd",
      fill: "currentColor",
      fillOpacity: ".8",
      d: "M22.40 10.20 L23.50 10.40 L23.22 11.78 L22.13 11.54 L21.37 12.67 L21.37 12.67 L22.01 13.59 L20.84 14.37 L20.24 13.43 L18.90 13.70 L18.90 13.70 L18.70 14.80 L17.32 14.52 L17.56 13.43 L16.43 12.67 L16.43 12.67 L15.51 13.31 L14.73 12.14 L15.67 11.54 L15.40 10.20 L15.40 10.20 L14.30 10.00 L14.58 8.62 L15.67 8.86 L16.43 7.73 L16.43 7.73 L15.79 6.81 L16.96 6.03 L17.56 6.97 L18.90 6.70 L18.90 6.70 L19.10 5.60 L20.48 5.88 L20.24 6.97 L21.37 7.73 L21.37 7.73 L22.29 7.09 L23.07 8.26 L22.13 8.86 L22.40 10.20Z M20.50 10.20 A1.6 1.6 0 1 0 17.30 10.20 A1.6 1.6 0 1 0 20.50 10.20Z"
    }), /*#__PURE__*/React.createElement("path", {
      fillRule: "evenodd",
      fill: "currentColor",
      d: "M15.91 19.05 L17.31 19.85 L16.30 21.52 L14.94 20.65 L13.42 21.75 L13.42 21.75 L13.85 23.31 L11.95 23.78 L11.60 22.20 L9.75 21.91 L9.75 21.91 L8.95 23.31 L7.28 22.30 L8.15 20.94 L7.05 19.42 L7.05 19.42 L5.49 19.85 L5.02 17.95 L6.60 17.60 L6.89 15.75 L6.89 15.75 L5.49 14.95 L6.50 13.28 L7.86 14.15 L9.38 13.05 L9.38 13.05 L8.95 11.49 L10.85 11.02 L11.20 12.60 L13.05 12.89 L13.05 12.89 L13.85 11.49 L15.52 12.50 L14.65 13.86 L15.75 15.38 L15.75 15.38 L17.31 14.95 L17.78 16.85 L16.20 17.20 L15.91 19.05Z M13.60 17.40 A2.2 2.2 0 1 0 9.20 17.40 A2.2 2.2 0 1 0 13.60 17.40Z"
    })),
    trend: P(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M3.5 17l5-5 3.5 3.5 6-6.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14.5 9h4v4"
    }))),
    __search: P(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "7"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M20 20l-3.7-3.7"
    })))
  };
})();
function LazyTab(props) {
  var info = LAZY_TABS[props.tabKey];
  // 数を1つ進めて描き直させる。真偽値だと、2つ目を開くときに
  // すでに true のままで描き直しが起きず、「読み込み中…」で止まる。
  var readyState = useState(0);
  var setReady = function () {
    readyState[1](function (n) {
      return (n | 0) + 1;
    });
  };
  var errState = useState(null);
  var err = errState[0],
    setErr = errState[1];
  useEffect(function () {
    var alive = true;
    if (window[info.comp] && window.__lazyLoaded && window.__lazyLoaded[info.file]) {
      setReady();
      return;
    }
    setErr(null);
    window.loadLazyTab(info.file).then(function () {
      if (alive) setReady();
    }).catch(function (e) {
      if (alive) setErr(e);
    });
    return function () {
      alive = false;
    };
  }, [props.tabKey]);
  if (err) {
    return React.createElement("div", {
      style: {
        padding: "60px 20px",
        textAlign: "center"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 14,
        color: "var(--sub)",
        marginBottom: 14,
        lineHeight: 1.7
      }
    }, "読み込みに失敗しました。\n通信環境をご確認ください。"), React.createElement("button", {
      onClick: function () {
        setErr(null);
        window.loadLazyTab(info.file).then(function () {
          setReady();
        }).catch(setErr);
      },
      style: {
        border: "1px solid var(--line)",
        background: "var(--card, #fff)",
        color: "var(--text)",
        borderRadius: 9,
        padding: "9px 18px",
        fontSize: 13,
        fontWeight: 800,
        cursor: "pointer"
      }
    }, "もう一度読み込む"));
  }
  var Comp = window[info.comp];
  if (!(window.__lazyLoaded && window.__lazyLoaded[info.file]) || !Comp) {
    return React.createElement("div", {
      style: {
        padding: "80px 20px",
        textAlign: "center"
      }
    }, React.createElement("div", {
      className: "spinner",
      style: {
        margin: "0 auto 14px"
      }
    }), React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--faint)",
        fontWeight: 700
      }
    }, "読み込み中…"));
  }
  return React.createElement(Comp, props.compProps || {});
}

// 部門（鮮魚／青果）の切り替え。メニューのマークの右に小さく置く。押すと読み込み直して切り替わる
// パソコン用：スイッチの形。つまみが滑ってから切り替わる（切り替えは読み込み直しになるので、先に動きを見せる）
// ── パソコンの右の柱：1列のナビ（2026-10-10） ──
// 字とひとことの説明を並べ、いま開いている画面には、すべって動く帯をのせる。
// まとまりを2つに分ける（つくる・しらべる／連絡と管理）。読み込み直すと版は下の足もとへ。
const NAV_ひとこと = {
  catalog: "予約カタログ・チラシ",
  gne: "POP画像・木札をつくる",
  order: "資料・試作システム",
  guide: "使い方を見る",
  request: "依頼・不具合を送る",
  admin: "整理・記録・お知らせ"
};
const NAV_組 = [["つくる・しらべる", ["catalog", "gne", "order", "guide"]], ["連絡と管理", ["request", "admin"]]];
function RightNav({
  items,
  tab,
  onGo
}) {
  const 箱 = React.useRef(null);
  const [帯, set帯] = useState({
    y: 0,
    h: 0,
    on: false
  });
  React.useLayoutEffect(() => {
    const el = 箱.current && 箱.current.querySelector('[data-nav="' + tab + '"]');
    if (!el) {
      set帯(v => ({
        ...v,
        on: false
      }));
      return;
    }
    set帯({
      y: el.offsetTop,
      h: el.offsetHeight,
      on: true
    });
  }, [tab, items.length]);
  return /*#__PURE__*/React.createElement("nav", {
    className: "mn",
    ref: 箱,
    "aria-label": "\u30E1\u30CB\u30E5\u30FC"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mn-band" + (帯.on ? " on" : ""),
    "aria-hidden": "true",
    style: {
      transform: "translateY(" + 帯.y + "px)",
      height: 帯.h
    }
  }), NAV_組.map(([題, keys]) => {
    const 中 = items.filter(o => keys.includes(o.key));
    if (!中.length) return null;
    return /*#__PURE__*/React.createElement("div", {
      className: "mn-grp",
      key: 題,
      role: "group",
      "aria-label": 題
    }, 中.map(o => /*#__PURE__*/React.createElement("button", {
      key: o.key,
      "data-nav": o.key,
      onClick: () => onGo(o.key),
      className: "mn-item menu-row-" + o.key + (tab === o.key ? " on" : ""),
      title: NAV_ひとこと[o.key] ? o.label + "：" + NAV_ひとこと[o.key] : o.label,
      "aria-current": tab === o.key ? "page" : undefined
    }, /*#__PURE__*/React.createElement("span", {
      className: "mn-ic"
    }, (o.key === "admin" ? MENU_ICON.adminMono : MENU_ICON[o.key]) || MENU_ICON.search), /*#__PURE__*/React.createElement("span", {
      className: "mn-tx"
    }, /*#__PURE__*/React.createElement("b", null, o.label)), /*#__PURE__*/React.createElement("span", {
      className: "mn-go",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9 6l6 6-6 6"
    }))), o.badge && /*#__PURE__*/React.createElement("span", {
      className: "mn-badge"
    }, o.badge))));
  }), /*#__PURE__*/React.createElement("div", {
    className: "mn-foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mn-ver"
  }, "\u7248 ", window.APP_VER || ""), /*#__PURE__*/React.createElement("button", {
    className: "mn-reload",
    onClick: () => {
      try {
        location.reload();
      } catch (e) {}
    },
    title: "\u8AAD\u307F\u8FBC\u307F\u76F4\u3059",
    "aria-label": "\u8AAD\u307F\u8FBC\u307F\u76F4\u3059"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    fill: "currentColor",
    d: "M19.97 15.22A8.6 8.6 0 0 0 6.71 5.22L8.80 7.90A5.2 5.2 0 0 1 16.82 13.95ZM5.10 3.17L4.13 9.39L10.40 9.95ZM4.03 8.78A8.6 8.6 0 0 0 17.29 18.78L15.20 16.10A5.2 5.2 0 0 1 7.18 10.05ZM18.90 20.83L19.87 14.61L13.60 14.05Z"
  })))));
}
function 部門スイッチ() {
  const 今 = deptKey();
  const [行き先, set行き先] = useState(今);
  const ks = Object.keys(DEPTS);
  const 右 = ks.indexOf(行き先) === 1;
  const 押す = k => {
    if (k === 行き先) return;
    set行き先(k);
    setTimeout(() => setDeptKey(k), 300);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "dept-sw" + (右 ? " right" : "") + " to-" + 行き先,
    role: "radiogroup",
    "aria-label": "\u90E8\u9580"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dept-sw-knob",
    "aria-hidden": "true"
  }), ks.map(k => /*#__PURE__*/React.createElement("button", {
    key: k,
    type: "button",
    role: "radio",
    "aria-checked": k === 行き先,
    className: "dept-sw-b" + (k === 行き先 ? " on" : ""),
    onClick: () => 押す(k)
  }, DEPTS[k].label)));
}
function 部門切替() {
  const 次 = deptNext();
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "dept-mini",
    onClick: () => setDeptKey(次),
    "aria-label": "いまは" + deptConf().label + "。押すと" + DEPTS[次].label + "に変わります",
    title: "部門をかえる（いま：" + deptConf().label + "）"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 8h13l-3-3M20 16H7l3 3"
  })), /*#__PURE__*/React.createElement("span", null, deptConf().label));
}
function App() {
  const [tab, setTab] = useState("board");
  const [currentStore, setCurrentStore] = useState(STORES[0]);
  useEffect(() => {
    api.logDeviceVisit(currentStore);
  }, []); // 端末記録：起動時に1回（1日1回まで）
  const boardActions = React.useRef({});
  const [showUpload, setShowUpload] = useState(false);
  const [toolSeed, setToolSeed] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); // さがす（右のドロワー）が開いているか
  // ホーム画面のアプリは、閉じても終了せず一時停止している。戻ってきたときに、
  // 切れた通信を待ち続けて止まらないよう、ここで取り直しを指示する。
  //   30秒以上離れていた → 一覧などを裏で取り直す（appResume）
  //   10分以上離れていた → ページごと読み直す（入力の途中なら読み直さない）
  useEffect(() => {
    let 離れた = 0;
    const 入力中 = () => {
      try {
        return [...document.querySelectorAll("input, textarea")].some(el => el.offsetParent !== null && (el.type === "file" ? el.files && el.files.length : String(el.value || "").trim() !== ""));
      } catch (e) {
        return false;
      }
    };
    const 見る = () => {
      if (document.visibilityState === "hidden") {
        離れた = Date.now();
        return;
      }
      if (!離れた) return;
      const 秒 = (Date.now() - 離れた) / 1000;
      離れた = 0;
      if (秒 >= 600 && !入力中()) {
        try {
          location.reload();
        } catch (e) {}
        return;
      }
      if (秒 >= 30) {
        try {
          window.dispatchEvent(new CustomEvent("appResume"));
        } catch (e) {}
      }
    };
    // 保存されていた画面から戻された場合も、取り直す
    const 復元 = e => {
      if (e && e.persisted) {
        try {
          window.dispatchEvent(new CustomEvent("appResume"));
        } catch (x) {}
      }
    };
    document.addEventListener("visibilitychange", 見る);
    window.addEventListener("pageshow", 復元);
    return () => {
      document.removeEventListener("visibilitychange", 見る);
      window.removeEventListener("pageshow", 復元);
    };
  }, []);

  // 使われた機能を数える（何が、だけ。誰が、は記録しない）
  useEffect(() => {
    try {
      api.logFeature("画面:" + tab);
    } catch (e) {}
  }, [tab]);
  // 前に起動が止まっていたら、どこで止まったかを1回だけ送る（直すときの手がかり）
  useEffect(() => {
    try {
      const 止 = localStorage.getItem("bootStall");
      if (止) {
        api.logFeature("起動停滞 " + 止);
        localStorage.removeItem("bootStall");
      }
    } catch (e) {}
  }, []);
  useEffect(() => {
    if (searchOpen) try {
      api.logFeature("さがす");
    } catch (e) {}
  }, [searchOpen]);
  useEffect(() => {
    const on = () => setSearchOpen(true),
      off = () => setSearchOpen(false);
    window.addEventListener("searchOpened", on);
    window.addEventListener("searchClosed", off);
    return () => {
      window.removeEventListener("searchOpened", on);
      window.removeEventListener("searchClosed", off);
    };
  }, []);
  const [showToTop, setShowToTop] = useState(false);
  const [popDetailOpen, setPopDetailOpen] = useState(false);
  useEffect(() => {
    const h = e => setPopDetailOpen(!!e.detail);
    window.addEventListener("popdetail", h);
    const g = e => {
      if (e.detail) {
        setRadialOpen(false);
        setTab(e.detail);
      }
    };
    window.addEventListener("gotoTab", g);
    return () => {
      window.removeEventListener("popdetail", h);
      window.removeEventListener("gotoTab", g);
    };
  }, []);

  // 一覧を開いたとき、横スライダーは「業界情報・競合情報」が中央に来る位置で表示
  useEffect(() => {
    if (tab !== "board") return;
    requestAnimationFrame(() => {
      const sc = document.getElementById("shelf-scroll");
      const a = document.getElementById("shelf-industry");
      const b = document.getElementById("shelf-competitor");
      if (!sc || !a || !b) return;
      const mid = (a.offsetLeft + (b.offsetLeft + b.offsetWidth)) / 2;
      sc.scrollLeft = Math.max(0, mid - sc.clientWidth / 2);
    });
  }, [tab]);
  const [wxCode, setWxCode] = useState(null);

  // 天気テーマ（ヘッダー背景をDynamic Island裏まで描画）
  const skyTheme = (() => {
    const hour = new Date().getHours();
    const night = hour >= 19 || hour < 5;
    const base = {
      bg: "linear-gradient(180deg,#8FA0B0 0%,#E8ECEF 70%,#ffffff 100%)",
      txtDark: true
    }; // フォールバック（通常）
    if (wxCode == null) return base;
    if (night) return {
      bg: "linear-gradient(180deg,#1E2A4A 0%,#2F3E63 55%,#4A5B85 100%)",
      pat: "radial-gradient(circle, rgba(255,255,255,0.85) 0.7px, transparent 1px)",
      patSize: "110px 80px",
      txtDark: false
    };
    const c = wxCode;
    if (c <= 1) return {
      bg: "linear-gradient(180deg,#5B9BD5 0%,#93C4EC 55%,#CFE7F9 100%)",
      txtDark: true
    };
    if (c <= 3 || c === 45 || c === 48) return {
      bg: "linear-gradient(180deg,#8A9BAC 0%,#BECAD5 55%,#E9EDF1 100%)",
      txtDark: true
    };
    if (c >= 71 && c <= 77 || c === 85 || c === 86) return {
      bg: "linear-gradient(180deg,#93AEC4 0%,#C9DCEA 60%,#EFF6FB 100%)",
      pat: "radial-gradient(circle, #ffffff 1.2px, transparent 1.5px)",
      patSize: "48px 40px",
      txtDark: true
    };
    return {
      bg: "linear-gradient(180deg,#3F4F66 0%,#5A6C86 60%,#7C90A7 100%)",
      pat: "repeating-linear-gradient(75deg, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 1px, transparent 1px, transparent 15px)",
      txtDark: false
    }; // 雨・雷
  })();
  const [radialOpen, setRadialOpen] = useState(false);
  const [scrollP, setScrollP] = useState(0); // 0=最上部 ... 1=ヘッダーがガラス化しきった状態
  const [toast, setToast] = useState(null);
  const [toastBad, setToastBad] = useState(false); // 赤いトースト（失敗のお知らせ）
  useEffect(() => {
    const h = e => {
      setToastBad(false);
      setToast(e.detail || "完了しました");
      setTimeout(() => setToast(null), 2200);
    };
    // 保存・投稿などの書き込みが失敗したとき（api層から届く）
    const bad = () => {
      setToastBad(true);
      setToast("保存できませんでした。電波を確かめて、もう一度お試しください");
      setTimeout(() => {
        setToast(null);
        setToastBad(false);
      }, 5000);
    };
    const goBoard = () => {
      setTab("board");
      setMoreOpen(false);
    };
    window.addEventListener("appToast", h);
    window.addEventListener("apiError", bad);
    const goTab = e => {
      try {
        setTab(e.detail);
      } catch (x) {}
    };
    window.addEventListener("goTab", goTab);
    window.addEventListener("goBoard", goBoard);
    return () => {
      window.removeEventListener("appToast", h);
      window.removeEventListener("apiError", bad);
      window.removeEventListener("goTab", goTab);
      window.removeEventListener("goBoard", goBoard);
    };
  }, []);
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [dataVer, setDataVer] = useState(0);
  const [notice, setNotice] = useState({
    enabled: false,
    message: "",
    tip_enabled: false,
    tip_message: "時期が過ぎたポップは、一覧から下げて保管しています。",
    feat_enabled: false,
    feat_message: "",
    feat_tab: "",
    feat_ver: "",
    badge_tab: "",
    badge_text: "",
    badge_ver: "",
    badge_until: null
  });
  const [badgeOn, setBadgeOn] = useState(false);
  const [bubbleShow, setBubbleShow] = useState(false); // 開いた瞬間だけ出る吹き出し
  const pullActive = React.useRef(false);
  const pullStart = React.useRef(0);
  const pullDist = React.useRef(0);
  useEffect(() => {
    const FADE_RANGE = 68;
    const el = scroller();
    if (!el) return;
    const onScroll = () => {
      const y = Math.min(el.scrollTop, FADE_RANGE);
      setScrollP(y / FADE_RANGE);
      setShowToTop(el.scrollTop > 240);
    };
    el.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);
  const doRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (tab === "board" && boardActions.current && boardActions.current.refresh) {
        await boardActions.current.refresh();
      } else if (tab === "search" || tab === "floor") {
        setDataVer(v => v + 1);
      }
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setRefreshing(false), 700);
  }, [tab]);
  useEffect(() => {
    const TH = 70;
    const el = scroller();
    if (!el) return;
    const onStart = e => {
      if (el.scrollTop <= 0 && !refreshing && !moreOpen && !radialOpen) {
        pullActive.current = true;
        pullStart.current = e.touches[0].clientY;
      } else {
        pullActive.current = false;
      }
    };
    const onMove = e => {
      if (!pullActive.current) return;
      const dy = e.touches[0].clientY - pullStart.current;
      if (dy > 0 && el.scrollTop <= 0) {
        const d = Math.min(dy * 0.5, 90);
        pullDist.current = d;
        setPullY(d);
        if (dy > 6 && e.cancelable) e.preventDefault();
      } else {
        pullActive.current = false;
        pullDist.current = 0;
        setPullY(0);
      }
    };
    const onEnd = () => {
      if (!pullActive.current) return;
      pullActive.current = false;
      if (pullDist.current >= TH) doRefresh();
      pullDist.current = 0;
      setPullY(0);
    };
    el.addEventListener("touchstart", onStart, {
      passive: true
    });
    el.addEventListener("touchmove", onMove, {
      passive: false
    });
    el.addEventListener("touchend", onEnd, {
      passive: true
    });
    el.addEventListener("touchcancel", onEnd, {
      passive: true
    });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [refreshing, moreOpen, radialOpen, doRefresh]);
  useEffect(() => {
    api.getNotice().then(n => {
      setNotice(n);
      // ナビの赤バッジ：期間内で、まだ見ていないお知らせだけ光らせる
      if (n && n.badge_tab && n.badge_ver) {
        const alive = !n.badge_until || new Date(n.badge_until).getTime() > Date.now();
        let seen = "";
        try {
          seen = localStorage.getItem("badgeSeenVer") || "";
        } catch (e) {}
        if (alive && n.badge_ver !== seen) {
          setBadgeOn(true);
          setBubbleShow(true);
          setTimeout(() => setBubbleShow(false), 4000); // 4秒でふわっと消える（赤丸は残る）
        }
      }
    }).catch(() => {});
  }, []);
  const clearBadge = () => {
    setBadgeOn(false);
    setBubbleShow(false);
    try {
      localStorage.setItem("badgeSeenVer", notice.badge_ver || "");
    } catch (e) {}
  };

  // 青果では、一覧の下に「初めての方はこちら」の案内を小さく出す（画面を乗っ取らない）。
  // 手引きを開くか × で閉じたら、次からは出さない。
  const [手引き案内, set手引き案内] = useState(() => {
    try {
      return typeof deptKey === "function" && deptKey() === "produce" && !localStorage.getItem("guideSeen");
    } catch (e) {
      return false;
    }
  });
  const 案内を閉じる = () => {
    try {
      localStorage.setItem("guideSeen", "1");
    } catch (e) {}
    set手引き案内(false);
  };

  // パソコンの広い画面では、メニューを左に開いたままにする
  const [広い, set広い] = useState(() => {
    try {
      return window.innerWidth >= 1280;
    } catch (e) {
      return false;
    }
  });
  useEffect(() => {
    const み = () => set広い(window.innerWidth >= 1280);
    window.addEventListener("resize", み);
    return () => window.removeEventListener("resize", み);
  }, []);
  useEffect(() => {
    if (広い) setMoreOpen(true);
  }, [広い]);
  // メニューに並べる項目（スマホのタイルと、パソコンの右の柱のナビで共通）
  const メニューの項目 = () => {
    // 青果では、ポップにまつわる3つだけを出す。開発まわりは鮮魚だけ。
    const 青果 = typeof deptKey === "function" && deptKey() === "produce";
    const ORDER = 青果 ? ["guide", "admin"] : ["bundle", "catalog", "gne", "order", "request", "admin"]; // アーカイブは管理画面の中だけに（2026-10-10）   // 手引きは青果だけ／試作システムは店舗支援の中へ（2026-10-10）
    // パソコンの右の柱では、検索（虫眼鏡）・行事（左の柱）・カタログ（上の行）が別にあるので出さない
    const 外す = 広い ? ["search", "bundle"] : [];
    return TAB_REGISTRY.filter(o => !外す.includes(o.key)).filter(o => !o.hideInMenu && ORDER.includes(o.key) && (o.key === "admin" || !(notice.menu_hidden || []).includes(o.key))).sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key)).map(o => 青果 ? {
      ...o,
      label: o.key === "admin" ? "管理" : o.label,
      __押し: o.key === "guide"
    } : o);
  };
  // 前の「アーカイブ」画面へ飛ぼうとしたら一覧へ（2026-10-10 一覧側のアーカイブをやめた）
  useEffect(() => {
    if (tab === "archive") setTab("board");
  }, [tab]);
  const [畳む, set畳む] = useState(() => {
    try {
      return localStorage.getItem("dockMin") === "1";
    } catch (e) {
      return false;
    }
  });
  const 畳みを切替 = () => set畳む(v => {
    const n = !v;
    try {
      localStorage.setItem("dockMin", n ? "1" : "0");
    } catch (e) {}
    return n;
  });
  useEffect(() => {
    try {
      if (広い && 畳む) document.documentElement.setAttribute("data-dock-min", "1");else document.documentElement.removeAttribute("data-dock-min");
    } catch (e) {}
  }, [広い, 畳む]);
  useEffect(() => {
    const sp = document.getElementById("splash");
    if (!sp) return;
    const t0 = window.__splashT0 || 0;
    // 見た目のCSSが届くまでは外さない。届く前に外すと、崩れた画面が見えてしまう。
    // 届かないときは index.html 側の見張りが「読み込み直す」を出す。
    let h = 0;
    const 試す = () => {
      if (!document.getElementById("splash")) return;
      if (window.__cssOK && Date.now() - t0 >= 900) {
        sp.classList.add("hide");
        setTimeout(() => sp.remove(), 500);
        return;
      }
      h = setTimeout(試す, 150);
    };
    試す();
    return () => clearTimeout(h);
  }, []);
  const handleCreateFromPop = pop => {
    setToolSeed({
      product: pop.product_name || "",
      image_url: pop.image_url
    });
    setTab("tool");
  };
  const handleCreatePop = seed => {
    setToolSeed(seed);
    setTab("tool");
  };
  const tabs = [{
    key: "board",
    icon: "📌",
    label: "一覧",
    color: "var(--primary)"
  }, {
    key: "floor",
    icon: "📸",
    label: "売場",
    color: "#2f6fb0"
  }, {
    key: "tool",
    icon: "✏️",
    label: "作成",
    color: "#8B6914"
  }, {
    key: "search",
    icon: "🔍",
    label: "検索",
    color: "#059669"
  }, {
    key: "catalog",
    icon: "📖",
    label: "予約カタログ",
    color: "#b8860b"
  }, {
    key: "barcode",
    icon: "🏷",
    label: "発注バーコード生成",
    color: "var(--primary)"
  }, {
    key: "dev",
    icon: "ℹ️",
    label: "お知らせ",
    color: "#6b7280"
  }, {
    key: "gne",
    icon: "🅖",
    label: "入力ジェネレーター",
    color: "#7c3aed"
  }];
  return /*#__PURE__*/React.createElement("div", {
    id: "app-scroll",
    style: {
      background: "var(--bg)",
      paddingBottom: "calc(70px + env(safe-area-inset-bottom))"
    }
  }, (pullY > 0 || refreshing) && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      top: 0,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 150,
      pointerEvents: "none",
      marginTop: refreshing ? 12 : Math.max(pullY - 30, 4),
      transition: pullActive.current ? "none" : "margin-top .25s"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: "50%",
      background: "var(--card, #fff)",
      boxShadow: "0 3px 12px rgba(0,0,0,0.18)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--primary)",
      fontSize: 18,
      fontWeight: 900,
      transform: refreshing ? undefined : `rotate(${pullY * 4}deg)`,
      animation: refreshing ? "spin 0.7s linear infinite" : "none"
    }
  }, "\u21BB")), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: "env(safe-area-inset-top)",
      background: "var(--bg)"
    }
  }), notice.enabled && notice.message && /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1600,
      margin: "0 auto",
      padding: "10px 16px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "notice-line"
  }, /*#__PURE__*/React.createElement("span", {
    className: "notice-dot",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      whiteSpace: "pre-wrap"
    }
  }, notice.message))), tab !== "board" && /*#__PURE__*/React.createElement("div", {
    className: "fs-top",
    style: {
      position: "sticky",
      top: 0,
      zIndex: 150,
      background: "var(--bg)",
      padding: "8px 14px 6px",
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setTab("board");
      setMoreOpen(false);
    },
    "aria-label": "\u4E00\u89A7\u306B\u3082\u3069\u308B",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      border: "1px solid var(--line)",
      background: "var(--card, #fff)",
      color: "var(--sub)",
      borderRadius: 10,
      padding: "8px 14px 8px 10px",
      fontSize: 13.5,
      fontWeight: 800,
      cursor: "pointer",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M15 5l-7 7 7 7"
  })), "\u3082\u3069\u308B"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 800,
      color: "var(--faint)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, (TAB_REGISTRY.find(t => t.key === tab) || {}).label || "")), tab === "board" && /*#__PURE__*/React.createElement(BoardTab, {
    onMenu: () => {
      if (badgeOn) clearBadge();
      setRadialOpen(false);
      setMoreOpen(true);
    },
    menuBadge: badgeOn,
    currentStore: currentStore,
    actionsRef: boardActions,
    onCreateFromPop: handleCreateFromPop,
    radialOpen: radialOpen,
    setRadialOpen: setRadialOpen,
    tipEnabled: notice.tip_enabled,
    tipMessage: notice.tip_message,
    feat: {
      enabled: notice.feat_enabled,
      message: notice.feat_message,
      tab: notice.feat_tab,
      ver: notice.feat_ver
    },
    onFeatGo: t => setTab(t)
  }), tab === "barcode" && /*#__PURE__*/React.createElement(LazyTab, {
    tabKey: "barcode"
  }), tab === "floor" && /*#__PURE__*/React.createElement(FloorPhotoTab, {
    key: "floor" + dataVer
  }), tab === "tool" && /*#__PURE__*/React.createElement(PopToolTab, {
    seed: toolSeed,
    onSeedConsumed: () => setToolSeed(null)
  }), tab === "catalog" && /*#__PURE__*/React.createElement(CatalogTab, null), tab === "order" && /*#__PURE__*/React.createElement(LazyTab, {
    tabKey: "order"
  }), tab === "lab" && /*#__PURE__*/React.createElement(LazyTab, {
    tabKey: "lab"
  }), tab === "guide" && /*#__PURE__*/React.createElement(LazyTab, {
    tabKey: "guide"
  }), tab === "bundle" && /*#__PURE__*/React.createElement(BundleTab, null), tab === "trend" && /*#__PURE__*/React.createElement(LazyTab, {
    tabKey: "trend"
  }), tab === "idea" && /*#__PURE__*/React.createElement(LazyTab, {
    tabKey: "idea"
  }), tab === "search" && /*#__PURE__*/React.createElement(SearchTab, {
    key: "search" + dataVer,
    onCreateFromPop: handleCreateFromPop,
    radialOpen: radialOpen,
    setRadialOpen: setRadialOpen
  }), tab === "gne" && /*#__PURE__*/React.createElement(LazyTab, {
    tabKey: "gne",
    compProps: {
      onCreatePop: handleCreatePop
    }
  }), tab === "souba" && /*#__PURE__*/React.createElement(SoubaTab, {
    onCreatePop: handleCreatePop
  }), tab === "industry" && /*#__PURE__*/React.createElement(IndustryTab, null), tab === "competitor" && /*#__PURE__*/React.createElement(CompetitorTab, null), tab === "calendar" && /*#__PURE__*/React.createElement(CalendarTab, null), tab === "fish" && /*#__PURE__*/React.createElement(LazyTab, {
    tabKey: "fish"
  }), tab === "popcheck" && /*#__PURE__*/React.createElement(PopCheckTab, null), tab === "admin" && /*#__PURE__*/React.createElement(LazyTab, {
    tabKey: "admin",
    compProps: {
      onNoticeChange: setNotice,
      onCreateFromPop: handleCreateFromPop
    }
  }), tab === "request" && /*#__PURE__*/React.createElement(LazyTab, {
    tabKey: "request"
  }), tab === "dev" && /*#__PURE__*/React.createElement(DevTab, null), showToTop && tab !== "board" && !moreOpen && !radialOpen && !popDetailOpen && /*#__PURE__*/React.createElement("button", {
    onClick: () => scrollerTop(true),
    "aria-label": "\u4E0A\u3078\u623B\u308B",
    style: {
      position: "fixed",
      ...(tab === "search" ? {
        right: 14
      } : {
        left: 14
      }),
      bottom: tab === "board" ? "calc(68px + env(safe-area-inset-bottom))" : "calc(52px + env(safe-area-inset-bottom))",
      zIndex: 190,
      width: 46,
      height: 46,
      borderRadius: 12,
      border: "none",
      background: "rgba(0,0,0,0.62)",
      backdropFilter: "blur(6px)",
      boxShadow: "0 3px 12px rgba(0,0,0,0.25)",
      color: "#fff",
      fontSize: 22,
      fontWeight: 900,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      animation: "fadeUp .25s ease"
    }
  }, "\u2191"), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      left: 0,
      right: 0,
      bottom: "calc(96px + env(safe-area-inset-bottom))",
      zIndex: 400,
      display: "flex",
      justifyContent: "center",
      pointerEvents: "none",
      padding: "0 24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    role: "status",
    "aria-live": "polite",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: toastBad ? "rgba(140,30,34,0.96)" : "rgba(26,43,60,0.94)",
      color: "#fff",
      borderRadius: 999,
      padding: "11px 20px",
      fontSize: 13.5,
      fontWeight: 800,
      boxShadow: "0 6px 20px rgba(0,0,0,0.28)",
      animation: "fadeUp .28s ease",
      backdropFilter: "blur(8px)",
      maxWidth: "100%"
    }
  }, toastBad ? /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "17",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#ffc9c1",
    strokeWidth: "2.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 7v7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 17.5v.01"
  })) : /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "17",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#6fe08a",
    strokeWidth: "2.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 12.5l5 5L20 6.5"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      overflow: "hidden",
      textOverflow: toastBad ? "clip" : "ellipsis",
      whiteSpace: toastBad ? "normal" : "nowrap",
      lineHeight: 1.5
    }
  }, toast))), 手引き案内 && tab === "board" && !searchOpen && (広い || !moreOpen) && /*#__PURE__*/React.createElement("div", {
    className: "guide-hint",
    role: "dialog",
    "aria-label": "\u521D\u3081\u3066\u306E\u65B9\u3078\u306E\u6848\u5185"
  }, /*#__PURE__*/React.createElement("button", {
    className: "gh-main",
    onClick: () => {
      案内を閉じる();
      setTab("guide");
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "gh-icon",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 5.5h16v13H4z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 9.5h8M8 13h5"
  }))), /*#__PURE__*/React.createElement("span", {
    className: "gh-text"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gh-t"
  }, "\u521D\u3081\u3066\u306E\u65B9\u306F\u3053\u3061\u3089"), /*#__PURE__*/React.createElement("span", {
    className: "gh-s"
  }, "\u4F7F\u3044\u65B9\u306E\u624B\u5F15\u304D\u3092\u898B\u308B")), /*#__PURE__*/React.createElement("span", {
    className: "gh-go",
    "aria-hidden": "true"
  }, "\u203A")), /*#__PURE__*/React.createElement("button", {
    className: "gh-x",
    onClick: 案内を閉じる,
    "aria-label": "\u6848\u5185\u3092\u9589\u3058\u308B"
  }, "\u2715")), tab === "board" && !searchOpen && (広い || !moreOpen) && /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      if (showToTop) {
        scrollerTop(true);
        return;
      }
      setMoreOpen(false);
      setRadialOpen(false);
      try {
        window.dispatchEvent(new CustomEvent("openSearch"));
      } catch (e) {}
    },
    className: "hig-pill fab-search",
    "aria-label": showToTop ? "上へ" : "さがす",
    title: showToTop ? "上へ" : "さがす",
    style: {
      position: "fixed",
      zIndex: 205,
      border: "none",
      cursor: "pointer",
      background: "#0F1A28",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 6px 20px rgba(10,20,35,0.36)"
    }
  }, showToTop ? /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 19V5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 12l7-7 7 7"
  })) : /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20 20l-4.1-4.1"
  })), /*#__PURE__*/React.createElement("span", null, showToTop ? "上へ" : "さがす")), (moreOpen || 広い) && /*#__PURE__*/React.createElement(React.Fragment, null, !広い && /*#__PURE__*/React.createElement("div", {
    onClick: () => setMoreOpen(false),
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 201,
      background: "rgba(0,0,0,0.28)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "fs-top menu-drawer" + (広い ? " menu-dock" : ""),
    style: {
      position: "fixed",
      right: 0,
      top: 0,
      bottom: 0,
      zIndex: 202,
      width: "min(320px, 86vw)",
      background: "var(--drawer-bg)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      boxShadow: "-6px 0 24px rgba(10,20,35,0.22)",
      overflowY: "auto",
      animation: "drawerIn .24s cubic-bezier(.16,1,.3,1)",
      paddingLeft: 14,
      paddingRight: 14,
      paddingBottom: "calc(18px + env(safe-area-inset-bottom))",
      display: "flex",
      flexDirection: "column"
    }
  }, 広い ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "dock-top"
  }, /*#__PURE__*/React.createElement("a", {
    className: "dock-brand",
    href: "./",
    "aria-label": "\u30DB\u30FC\u30E0\uFF08\u4E00\u89A7\uFF09\u306B\u3082\u3069\u308B",
    onClick: e => {
      e.preventDefault();
      setTab("board");
      try {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      } catch (_) {}
    }
  }, /*#__PURE__*/React.createElement("img", {
    className: "dock-logo",
    src: "brand-logo-dark.png?v=" + (window.APP_VER || ""),
    alt: "GoodDay NEXUS PROJECT"
  }), /*#__PURE__*/React.createElement("img", {
    className: "dock-mark",
    src: "brand-mark.png",
    alt: "",
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("div", {
    className: "dock-ctl"
  }, 畳む ? /*#__PURE__*/React.createElement(部門切替, null) : /*#__PURE__*/React.createElement(部門スイッチ, null)))) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 900,
      color: "var(--ink)",
      display: 広い ? "none" : "block"
    }
  }, "\u30E1\u30CB\u30E5\u30FC"), !広い && /*#__PURE__*/React.createElement("button", {
    onClick: () => setMoreOpen(false),
    "aria-label": "\u9589\u3058\u308B",
    style: {
      marginLeft: "auto",
      border: "none",
      background: "var(--chip)",
      color: "var(--sub)",
      borderRadius: 9,
      width: 34,
      height: 34,
      cursor: "pointer",
      fontSize: 15,
      fontWeight: 900
    }
  }, "\u2715")), !広い && /*#__PURE__*/React.createElement("div", {
    className: "dock-top",
    style: {
      marginTop: 0,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("a", {
    className: "dock-brand",
    href: "./",
    "aria-label": "\u30DB\u30FC\u30E0\uFF08\u4E00\u89A7\uFF09\u306B\u3082\u3069\u308B",
    onClick: e => {
      e.preventDefault();
      setTab("board");
      setMoreOpen(false);
      try {
        window.scrollTo({
          top: 0
        });
      } catch (_) {}
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "brand-logo-dark.png?v=" + (window.APP_VER || ""),
    alt: "GoodDay NEXUS PROJECT"
  })), /*#__PURE__*/React.createElement("div", {
    className: "dock-ctl"
  }, /*#__PURE__*/React.createElement(部門スイッチ, null))), 広い && !畳む ? /*#__PURE__*/React.createElement(RightNav, {
    items: メニューの項目(),
    tab: tab,
    onGo: k => {
      setTab(k);
      setMoreOpen(false);
    }
  }) : /*#__PURE__*/React.createElement("div", {
    className: "menu-list menu-grid"
  }, メニューの項目().map((o, i, 全部) => {
    // 最後に「読み込み直す」のタイルが並ぶ。管理画面と読み込み直すが同じ段に並ぶよう、
    // 数が合わないときは管理画面の1つ前のタイルを横いっぱいにする（2026-10-10）
    const 列 = 広い ? 2 : 3;
    const 管理の位置 = 全部.findIndex(x => x.key === "admin");
    const 前 = 管理の位置 > 0 && i === 管理の位置 - 1;
    const 余り = 列 === 2 && (全部.length + 1) % 2 === 1 && 前; // 2列：1つ前を横いっぱい
    const 二枠 = 列 === 3 && (全部.length + 1) % 3 === 1 && 前; // 3列：1つ前を2枠ぶん
    return /*#__PURE__*/React.createElement("button", {
      key: o.key,
      onClick: () => {
        setTab(o.key);
        setMoreOpen(false);
      },
      "aria-label": o.label,
      title: o.label,
      "aria-current": tab === o.key ? "page" : undefined,
      className: "menu-item menu-tile menu-row-" + o.key + (o.key === "search" || 余り ? " menu-tile-wide" : "") + (二枠 ? " menu-tile-span2" : "") + (o.__押し ? " menu-push" : "") + (tab === o.key ? " on" : "")
    }, /*#__PURE__*/React.createElement("span", {
      className: "menu-tile-ic"
    }, MENU_ICON[o.key] || MENU_ICON.search, o.badge && /*#__PURE__*/React.createElement("span", {
      className: "menu-tile-badge"
    }, o.badge)), /*#__PURE__*/React.createElement("span", {
      className: "menu-tile-t"
    }, o.label));
  }), /*#__PURE__*/React.createElement("button", {
    className: "menu-item menu-tile menu-row-reload",
    onClick: () => {
      try {
        location.reload();
      } catch (e) {}
    },
    title: "\u8AAD\u307F\u8FBC\u307F\u76F4\u3059",
    "aria-label": "\u8AAD\u307F\u8FBC\u307F\u76F4\u3059"
  }, /*#__PURE__*/React.createElement("span", {
    className: "menu-tile-ic"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    fill: "currentColor",
    d: "M19.97 15.22A8.6 8.6 0 0 0 6.71 5.22L8.80 7.90A5.2 5.2 0 0 1 16.82 13.95ZM5.10 3.17L4.13 9.39L10.40 9.95ZM4.03 8.78A8.6 8.6 0 0 0 17.29 18.78L15.20 16.10A5.2 5.2 0 0 1 7.18 10.05ZM18.90 20.83L19.87 14.61L13.60 14.05Z"
  })))))), 広い && /*#__PURE__*/React.createElement("button", {
    className: "dock-fold",
    onClick: 畳みを切替,
    "aria-label": 畳む ? "メニューをひろげる" : "メニューをたたむ",
    title: 畳む ? "メニューをひろげる" : "メニューをたたむ",
    "aria-expanded": !畳む
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, 畳む ? /*#__PURE__*/React.createElement("path", {
    d: "M15 5l-7 7 7 7"
  }) : /*#__PURE__*/React.createElement("path", {
    d: "M9 5l7 7-7 7"
  })))), 広い && /*#__PURE__*/React.createElement("aside", {
    className: "cal-dock fs-top"
  }, /*#__PURE__*/React.createElement(CalendarDock, null)), showUpload && /*#__PURE__*/React.createElement(UploadModal, {
    currentStore: currentStore,
    onClose: () => setShowUpload(false),
    onSuccess: () => {
      setShowUpload(false);
      if (boardActions.current && boardActions.current.refresh) boardActions.current.refresh();
    }
  }));
}

// 画面が真っ白になるのを防ぎ、原因をその場に表示する安全網
class ErrBoundary extends React.Component {
  constructor(p) {
    super(p);
    this.state = {
      err: null
    };
  }
  static getDerivedStateFromError(err) {
    return {
      err
    };
  }
  componentDidCatch(err, info) {
    try {
      console.error("画面エラー:", err, info);
    } catch (e) {}
  }
  render() {
    if (!this.state.err) return this.props.children;
    const msg = String(this.state.err && (this.state.err.stack || this.state.err.message || this.state.err));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "28px 20px",
        maxWidth: 640,
        margin: "0 auto",
        fontFamily: "inherit"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 17,
        fontWeight: 900,
        color: "#b3261e",
        marginBottom: 8
      }
    }, "\u8868\u793A\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--sub)",
        lineHeight: 1.7,
        marginBottom: 14
      }
    }, "\u4E0B\u306E\u5185\u5BB9\u3092\u305D\u306E\u307E\u307E\u30B3\u30D4\u30FC\u3057\u3066\u958B\u767A\u62C5\u5F53\u306B\u9001\u3063\u3066\u304F\u3060\u3055\u3044\u3002\u30A2\u30D7\u30EA\u306E\u4ED6\u306E\u753B\u9762\u306F\u4F7F\u3048\u307E\u3059\u3002"), /*#__PURE__*/React.createElement("textarea", {
      readOnly: true,
      value: msg,
      style: {
        width: "100%",
        boxSizing: "border-box",
        height: 180,
        fontSize: 12,
        lineHeight: 1.6,
        border: "1px solid var(--line)",
        borderRadius: 10,
        padding: "10px 12px",
        background: "var(--card, #fff)",
        fontFamily: "monospace"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        try {
          navigator.clipboard.writeText(msg);
        } catch (e) {}
      },
      style: {
        flex: 1,
        border: "none",
        background: "var(--fill)",
        color: "#fff",
        borderRadius: 10,
        padding: "12px",
        fontSize: 14,
        fontWeight: 800,
        cursor: "pointer"
      }
    }, "\u30B3\u30D4\u30FC\u3059\u308B"), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        this.setState({
          err: null
        });
      },
      style: {
        flex: 1,
        border: "1px solid var(--line)",
        background: "var(--card, #fff)",
        color: "var(--text)",
        borderRadius: 10,
        padding: "12px",
        fontSize: 14,
        fontWeight: 800,
        cursor: "pointer"
      }
    }, "\u623B\u308B")));
  }
}
ReactDOM.render(/*#__PURE__*/React.createElement(ErrBoundary, null, /*#__PURE__*/React.createElement(App, null)), document.getElementById("root"));
;
Object.assign(window, {
  App,
  LazyTab
});