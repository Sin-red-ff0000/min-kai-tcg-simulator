みん会TCG Simulator v24.6 公開所 管理キー仕様修正版 rev3

今回の管理キー仕様
- 自分の管理キー: ユーザーごとに1つ。端末に保存。自分が公開する全カードへ自動設定。
- 開発者マスターキー: 全公開カード共通。DBやHTMLには保存しない。Supabase Edge Function Secretでのみ管理。
- 臨時管理キー欄: 他人の「自分の管理キー」を一時入力する欄。ブラウザへ保存しない。入力中だけ、その人の公開カードを編集可能。
- 公開カードにはカードIDコピーボタンを追加。

Supabase
1. SQL Editorで SUPABASE_PUBLIC_CARDS_v24_6_KEYS_REV3.sql を全文実行
2. Edge Functions > Secrets で以下を追加
   Name: MINKAI_PUBLIC_MASTER_KEY
   Value: 開発者だけが知る十分に長いマスターキー
3. Edge Functions > minkai-public-cards を開き、index.tsをこのZIP内のものへ全文置換してDeploy
4. minkai-online は変更不要

重要
- MINKAI_PUBLIC_MASTER_KEY をGitHub、HTML、README、チャット等へ書かないでください。
- マスターキー入力欄はアプリ上にありますが、入力値はlocalStorageへ保存しません。
