# Supabase minkai-online v24.5 server patch requirements

この版のクライアントは、オンライン「上からX枚を見る」で次の2 actionを使用する。

- `peek-top`
- `commit-top-inspection`

既存のSupabase Edge Function `minkai-online` に上記2 actionの実装が必要。DBスキーマ変更は必須ではない。現在のserver-only deck order保存先をそのまま使用できる。

実装契約の詳細は `REMOTE_API_SPEC_v13_10.md` を参照。

重要: クライアント側だけ更新し、Edge Functionがv13.9のままの場合、「まとめて移動」は既存drawで動作するが、「中身を確認」は unknown-action になる。cardId非公開性を壊すため、ローカルshadow deckへのフォールバックは行わない。
