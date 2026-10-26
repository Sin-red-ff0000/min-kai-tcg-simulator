# 加工追加の導線（Ver48.4）

## 今回整備した内容
- `effect_extensions.json`：追加加工のID・正式名称・描画担当の一覧。
- `devtools/validate_effects.py`：本体と加工エディターの登録一致、ID重複、名称破損を検査。
- `devtools/add_effect.py`：本体と加工エディターの両方へ新加工の登録を自動追加。
- エディター起動時にも、登録ID・名称・重複・既存10種類の件数をチェック。

## 今後の追加手順
1. `python devtools/add_effect.py new-effect-id "新しい加工名"` を実行。
2. `fx_trial_preview.html` の新加工描画処理を実装し、未実装の例外を実際のディスパッチへ置換。
3. `effect_extensions.json` の `renderer: "TODO"` を実装関数名へ変更。
4. `python devtools/validate_effects.py` を実行。
5. ブラウザでカード選択→加工選択→スライダー→傾斜→保存→再読込を確認。
6. バージョンをアプリ・エディター・タブ・Service Worker・ZIPで一括更新。

**注意:** 加工を一覧に登録するだけでは描画できません。元の採用加工の式を移植してから動作確認します。既存の10種類の順序や `mk477Render` のインデックスは変更しないでください。
