-- 2026-10-09 (c) 閉じる。アプリを (b) に更新してから当てる
--
-- ① 命令は通行証だけを受ける（生の合言葉では通らない）
create or replace function public._check_secret(p_purpose text, p_password text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
begin
  return p_password is not null and length(p_password) = 48 and exists (
    select 1 from public.auth_tokens
     where kind = p_purpose and expires_at > now()
       and token_hash = encode(extensions.digest(p_password, 'sha256'), 'hex'));
end $$;
revoke execute on function public._check_secret(text, text) from public, anon, authenticated;

-- ② 回数を数えずに合言葉を照合できる古い入口を閉じる（アプリは (b) から使っていない）
revoke execute on function public.verify_password(text, text) from public, anon, authenticated;

-- ③ ポップの表：「誰でも削除」「誰でも更新」をやめる。
--    削除・名前・ジャンル・アーカイブ・閲覧数などは、すべて所有者の権限で動く命令（SECURITY DEFINER）が
--    行っているので影響しない。読むこと・投稿（追加）は今まで通り。
drop policy if exists "delete" on public.pops;
drop policy if exists "anyone can update likes" on public.pops;
