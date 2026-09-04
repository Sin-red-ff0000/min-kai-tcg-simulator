みん会TCG Simulator v24.5 修正パッチ
対象: GitHub Pages 側

修正内容
1. アカウント通常クラウド同期
   accountCloudRequest() の apikey 参照を
   ACCOUNT_FULL_CLOUD_KEY
   から
   ACCOUNT_SUPABASE_PUBLISHABLE_KEY
   へ修正。

2. ログイン/新規登録/セッション復元
   クラウド保存領域の確認失敗が Auth 成功そのものを巻き込まないよう、
   accountCloudCheck() を安全に分離。

3. オンライン対戦盤面
   onlineRenderDuelBoard() の再描画前に
   captureHandScroll() / captureFixedZoneScroll()
   を呼び、再描画後に restoreBoardScroll() を呼ぶよう修正。
   同期のたびに手札・盤面の横スクロール位置が先頭へ戻る問題を対策。

Supabase側
Authentication > URL Configuration の Site URL / Redirect URLs は
https://sin-red-ff0000.github.io/min-kai-tcg-simulator/
へ更新済みとのことなので、このパッチでは変更不要。

アップロード方法
GitHub リポジトリのルートにある index.html を、このファイルで上書きしてください。
