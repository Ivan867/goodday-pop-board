-- 2026-10-10 (e) 店舗支援と試作システムの番号を、サーバー側で照合する
--
-- 今まで：番号がアプリのファイルの中に書いてあり、ファイルを開けば読めた。
-- これから：番号の「指紋」（sha256）だけをサーバーに置き、照合は check_secret_limited で行う。
--           3回まちがえると5分、5回で30分、7回以上で2時間止まる（管理の合言葉と同じ）。
-- 番号そのものは変えません（いつもの番号のまま入れます）。
-- このファイルにも番号そのものは書いていません（指紋だけ）。

insert into public.app_secrets (key, value) values
  ('support', '2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3'),
  ('lab',     'd7e1edcac43af8cea1439d222314af06354ae31da6a3d90b8cc6bcebc5c8e397')
on conflict (key) do update set value = excluded.value;
