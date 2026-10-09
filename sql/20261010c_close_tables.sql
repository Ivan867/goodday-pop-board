-- 2026-10-10 (3) 閉じる。アプリを更新してから当てる。データは消さない。読むのは今まで通り。
-- 品目・カタログ・資料・まとめ：書き換えは admin_write（管理の通行証）だけ
drop policy if exists oi_insert  on public.order_items;
drop policy if exists oi_update  on public.order_items;
drop policy if exists oi_delete  on public.order_items;
drop policy if exists cat_insert on public.catalogs;
drop policy if exists cat_update on public.catalogs;
drop policy if exists cat_delete on public.catalogs;
drop policy if exists res_insert on public.resources;
drop policy if exists res_update on public.resources;
drop policy if exists res_delete on public.resources;

drop policy if exists pb_all  on public.pop_bundles;
drop policy if exists pbi_all on public.pop_bundle_items;
drop policy if exists pbp_all on public.pop_bundle_prompts;
create policy pb_read  on public.pop_bundles        for select using (true);
create policy pbi_read on public.pop_bundle_items   for select using (true);
create policy pbp_read on public.pop_bundle_prompts for select using (true);

-- 毎週の発注数・指示書・記録：機能をやめたので、誰も書けないようにする（中身は残す）
drop policy if exists ol_insert on public.order_logs;
drop policy if exists ol_update on public.order_logs;
drop policy if exists ol_delete on public.order_logs;
drop policy if exists os_all  on public.order_sheets;
drop policy if exists osr_all on public.order_sheet_rows;
create policy os_read  on public.order_sheets     for select using (true);
create policy osr_read on public.order_sheet_rows for select using (true);
