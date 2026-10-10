-- 2026-10-10 (d) 残りの「誰でも書ける」を閉じる
--
-- そのまま残すもの（誰でも書けないとアプリが働かないもの。いずれも「足す」だけ）
--   pops の投稿、pop_comments の書き込み、pop_requests のお問い合わせ送信、
--   floor_photos・gne_presets・prompt_library・shared_tray_presets の追加、
--   記録（device_visits・feature_uses・pop_views・op_logs）
--
-- 閉じるもの
--   ① アプリから使っていない書き込み：market_trends・promo_plans・tray_presets・production_notes
--   ② 管理の命令に移したもの：site_notice（admin_update_notice で書く）、
--      pop_requests の返信・削除、floor_photos・gne_presets・prompt_library・shared_tray_presets の削除
--   ③ 画像置き場（pop-images）を誰でも消せる許可
--
-- データは1件も消しません。外すのは「許可」だけです。

begin;

-- ── 管理の命令を広げる：表を5つ足す。消すときだけは「削除の合言葉」の通行証でも通す ──
create or replace function public.admin_write(p_table text, p_op text, p_id uuid, p_row jsonb, p_password text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare cols text; res jsonb;
begin
  if not (public._check_secret('admin', p_password)
          or (p_op = 'delete' and public._check_secret('delete', p_password))) then
    raise exception 'bad_password';
  end if;
  if p_table not in ('order_items','catalogs','resources','pop_bundles','pop_bundle_items','pop_bundle_prompts',
                     'pop_requests','floor_photos','gne_presets','prompt_library','shared_tray_presets') then
    raise exception 'bad_table';
  end if;

  if p_op = 'delete' then
    execute format('delete from public.%I where id = $1', p_table) using p_id;
    return null;
  end if;

  select string_agg(quote_ident(k), ',') into cols
    from jsonb_object_keys(coalesce(p_row, '{}'::jsonb)) k
   where k <> 'id' and exists (select 1 from information_schema.columns c
                                where c.table_schema = 'public' and c.table_name = p_table and c.column_name = k);
  if cols is null then raise exception 'empty_row'; end if;

  if p_op = 'insert' then
    execute format('insert into public.%1$I (%2$s) select %2$s from jsonb_populate_record(null::public.%1$I, $1) returning to_jsonb(%1$I.*)',
                   p_table, cols) into res using p_row;
  elsif p_op = 'update' then
    execute format('update public.%1$I t set (%2$s) = (select %2$s from jsonb_populate_record(null::public.%1$I, $1)) where t.id = $2 returning to_jsonb(t.*)',
                   p_table, cols) into res using p_row, p_id;
  else
    raise exception 'bad_op';
  end if;
  return res;
end $$;
revoke execute on function public.admin_write(text, text, uuid, jsonb, text) from public;
grant execute on function public.admin_write(text, text, uuid, jsonb, text) to anon, authenticated;

-- ① 使っていない書き込み
drop policy if exists mt_insert on public.market_trends;
drop policy if exists mt_update on public.market_trends;
drop policy if exists mt_delete on public.market_trends;
drop policy if exists pp_insert on public.promo_plans;
drop policy if exists pp_update on public.promo_plans;
drop policy if exists pp_delete on public.promo_plans;
drop policy if exists tp_insert on public.tray_presets;
drop policy if exists tp_update on public.tray_presets;
drop policy if exists tp_delete on public.tray_presets;
drop policy if exists pn_update on public.production_notes;

-- ② 管理の命令に移したもの
drop policy if exists sn_update on public.site_notice;
drop policy if exists public_update on public.pop_requests;
drop policy if exists public_delete on public.pop_requests;
drop policy if exists "anyone can delete floor_photos" on public.floor_photos;
drop policy if exists gp_delete on public.gne_presets;
drop policy if exists pl_delete on public.prompt_library;
drop policy if exists stp_update on public.shared_tray_presets;
drop policy if exists stp_delete on public.shared_tray_presets;

commit;

-- ③ 画像置き場：誰でも消せる許可を外す（投稿と閲覧はそのまま）
--    ここだけ別にしてあります。もし「must be owner」と出ても、上の①②はもう当たっています。
drop policy if exists storage_delete on storage.objects;
