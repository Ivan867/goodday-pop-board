-- 2026-10-10 (1) 足すだけ。今のアプリはこのまま動く
-- 品目・まとめ・カタログ・資料を、管理の通行証を持っている人だけが書き換えられるようにするための命令。
-- 表ごとに命令を作る代わりに、決めた表だけを受け付ける1つの命令にする。
--   p_op: 'insert' / 'update' / 'delete'
--   p_row: 書く中身（表にない列名は無視。id は書かせない）
-- 列名は quote_ident、値は jsonb_populate_record で型どおりに入れるので、文字を混ぜて命令を変えることはできない。
create or replace function public.admin_write(p_table text, p_op text, p_id uuid, p_row jsonb, p_password text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare cols text; res jsonb;
begin
  if not public._check_secret('admin', p_password) then raise exception 'bad_password'; end if;
  if p_table not in ('order_items','catalogs','resources','pop_bundles','pop_bundle_items','pop_bundle_prompts') then
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
