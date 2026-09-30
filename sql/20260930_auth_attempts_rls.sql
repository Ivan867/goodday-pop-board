-- 2026-09-30 適用済み（Supabase migration: secure_auth_attempts_and_internal_functions）
-- Supabase Security Advisor の Critical「rls_disabled_in_public: public.auth_attempts」への対応。
--
-- 調べたこと
--   auth_attempts は合言葉の失敗回数とロック解除時刻だけを持つ内部の表。
--   画面（js/*.jsx）からは一度も参照していない。触るのは次の2つだけで、
--   どちらも SECURITY DEFINER（postgres として動く）なので RLS を素通りする。
--     - check_secret_limited(kind, password)  … 照合＋回数を数える。画面はこれだけを呼ぶ
--     - reset_auth_lock(kind)                 … ロック解除。画面からは呼んでいない
--   したがってポリシーは1つも要らない。作らずに RLS を有効にすれば全面遮断になる。

alter table public.auth_attempts enable row level security;
revoke all on table public.auth_attempts from anon, authenticated;

-- reset_auth_lock は合言葉を要求せずロックを解除する。公開したままだと
-- 誰でも解除でき、回数制限そのものが無意味になる。画面は呼んでいないので閉じる。
revoke execute on function public.reset_auth_lock(text) from public, anon, authenticated;

-- _check_secret は他の関数から呼ばれる内部処理。画面からは呼んでいない。
-- 他の SECURITY DEFINER 関数は postgres として動くので、閉じても中から呼べる。
revoke execute on function public._check_secret(text, text) from public, anon, authenticated;

-- 確認（anon になって実行した結果）
--   check_secret_limited('admin','誤り') → {"ok":false,"fails":1,"left":2}  … 回数制限は生きている
--   admin_delete_pops('{}','誤り')       → bad_password                     … 内部の _check_secret は呼べている
--   select from auth_attempts            → permission denied
--   pops / pop_comments / pop_bundles / site_notice / order_items / catalogs → これまで通り読める
--   app_secrets                          → 0件（RLS で遮断。中身は2件ある）
