# RELEASE_AUDIT_v24_6

## 追加
- ログイン不要のカード公開所を追加
- 登録カード1枚を画像なしデータとして公開
- 公開カードの検索（カード名 / 作者名 / 種類）と並び替え（新着 / DL数 / 名前）
- 公開カードを端末へ独立コピーとしてダウンロード
- 同名カード時に「別カード / 上書き / キャンセル」を選択
- 公開時にカード専用管理キーを発行
- 管理キーを保持する端末だけ公開内容の更新・削除が可能
- 別端末への管理キー登録機能
- ダウンロード数表示

## v24.5から継続して含む修正
- accountCloudRequest の publishable key 参照修正
- Auth成功とクラウド確認処理の分離
- オンライン同期時の手札・盤面スクロール位置復元

## データ方針
- 公開所にはカード画像を保存しない
- image / imageData / imageUrl / imageSourceCardId / cardLinks を公開データから除外
- custom: 系の端末依存カスタムエフェクト参照は公開時に除外
- ダウンロードしたカードは新しいローカルIDを持つ独立コピー

## Supabase
v24.6公開所を使うには以下の2点が必要。
1. SUPABASE_PUBLIC_CARDS_v24_6.sql を SQL Editor で実行
2. Edge Function `minkai-public-cards` を作成し、supabase/functions/minkai-public-cards/index.ts を配置してDeploy
