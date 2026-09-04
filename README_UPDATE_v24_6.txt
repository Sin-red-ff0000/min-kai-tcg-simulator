みん会TCG Simulator v24.6 更新手順

GitHub
1. index.html をリポジトリのルートへ上書き
2. RELEASE_AUDIT_v24_6.md は更新記録として追加推奨

Supabase
1. Dashboard → SQL Editor → New query
2. SUPABASE_PUBLIC_CARDS_v24_6.sql の全文を貼り付けて Run
3. Dashboard → Edge Functions
4. minkai-public-cards というFunctionを新規作成
5. supabase/functions/minkai-public-cards/index.ts の全文で置き換えて Deploy

既存の minkai-online Edge Function は変更しません。
Authentication の Site URL / Redirect URL は更新済みとのことなので、v24.6公開所のための追加変更はありません。

公開所の仕様
- ログイン不要
- 画像なし
- 公開カードは誰でも閲覧・DL可能
- 公開時に管理キーを発行
- 管理キー保持者だけ更新・削除可能
- DL後のカードは公開元とは独立したコピー
