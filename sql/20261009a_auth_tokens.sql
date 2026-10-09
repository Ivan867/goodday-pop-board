-- 2026-10-09 (a) 足すだけ。いまのアプリはこのまま動く（生の合言葉も、通行証も、どちらも通る）
--
-- 目的：管理の命令（admin_* など19個）は、合言葉をそのまま受け取って照合していた。
--       その照合は回数を数えないので、命令を直接呼べば合言葉を何度でも試せた。
-- 対策：合言葉は回数制限つきの check_secret_limited でだけ照合し、通れば「通行証」を渡す。
--       命令は通行証で受ける（(c) で生の合言葉を受けなくする）。
--       通行証は 48桁のでたらめな文字。保存するのはそのハッシュだけ。12時間で切れる。

-- 通行証の置き場。外からは読めも書けもしない（ポリシーなし＋権限を外す）
create table if not exists public.auth_tokens (
  token_hash text primary key,
  kind       text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
alter table public.auth_tokens enable row level security;
revoke all on table public.auth_tokens from anon, authenticated;

-- 生の合言葉を照合する（中身は今の _check_secret と同じ）。外からは呼べない
create or replace function public._check_raw_secret(p_purpose text, p_password text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare stored text;
begin
  select value into stored from public.app_secrets where key = p_purpose;
  if stored is null then return false; end if;
  return stored = encode(extensions.digest(coalesce(p_password,''), 'sha256'), 'hex');
end $$;
revoke execute on function public._check_raw_secret(text, text) from public, anon, authenticated;

-- 命令が使う照合：(a) の間は「通行証」か「生の合言葉」のどちらでも通す
create or replace function public._check_secret(p_purpose text, p_password text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
begin
  if p_password is not null and length(p_password) = 48 and exists (
       select 1 from public.auth_tokens
        where kind = p_purpose and expires_at > now()
          and token_hash = encode(extensions.digest(p_password, 'sha256'), 'hex')) then
    return true;
  end if;
  return public._check_raw_secret(p_purpose, p_password);   -- (c) でこの行を消す
end $$;
revoke execute on function public._check_secret(text, text) from public, anon, authenticated;

-- 回数制限つきの照合：通ったら通行証を返す（ほかは今までと同じ）
create or replace function public.check_secret_limited(p_kind text, p_password text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare
  rec public.auth_attempts%rowtype;
  ok boolean;
  wait_min int;
  tok text;
begin
  select * into rec from public.auth_attempts where kind = p_kind;

  -- ロック中なら残り時間を返す
  if rec.locked_until is not null and rec.locked_until > now() then
    return jsonb_build_object(
      'ok', false, 'locked', true,
      'seconds', ceil(extract(epoch from (rec.locked_until - now())))::int);
  end if;

  ok := public._check_raw_secret(p_kind, p_password);

  if ok then
    delete from public.auth_attempts where kind = p_kind;
    delete from public.auth_tokens where expires_at < now();          -- 切れた通行証の掃除
    tok := encode(extensions.gen_random_bytes(24), 'hex');           -- 48桁
    insert into public.auth_tokens (token_hash, kind, expires_at)
    values (encode(extensions.digest(tok, 'sha256'), 'hex'), p_kind, now() + interval '12 hours');
    return jsonb_build_object('ok', true, 'locked', false, 'token', tok);
  end if;

  -- 失敗：回数を増やす
  insert into public.auth_attempts (kind, fails, last_fail_at)
  values (p_kind, 1, now())
  on conflict (kind) do update
    set fails = public.auth_attempts.fails + 1, last_fail_at = now()
  returning * into rec;

  -- 3回で5分、5回で30分、7回以上は2時間
  wait_min := case
    when rec.fails >= 7 then 120
    when rec.fails >= 5 then 30
    when rec.fails >= 3 then 5
    else 0 end;

  if wait_min > 0 then
    update public.auth_attempts
       set locked_until = now() + (wait_min || ' minutes')::interval
     where kind = p_kind
     returning * into rec;
    return jsonb_build_object('ok', false, 'locked', true,
      'seconds', wait_min * 60, 'fails', rec.fails);
  end if;

  return jsonb_build_object('ok', false, 'locked', false,
    'fails', rec.fails, 'left', 3 - rec.fails);
end $$;

-- ポップの向きの変更：今はアプリが表に直接書いている。(c) で直接の書き込みを閉じるので、管理の命令にする
create or replace function public.admin_set_rotation(p_id uuid, p_deg integer, p_password text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if not public._check_secret('admin', p_password) then raise exception 'bad_password'; end if;
  update public.pops set rotation = ((coalesce(p_deg,0) % 360) + 360) % 360 where id = p_id;
end $$;
revoke execute on function public.admin_set_rotation(uuid, integer, text) from public;
grant execute on function public.admin_set_rotation(uuid, integer, text) to anon, authenticated;
