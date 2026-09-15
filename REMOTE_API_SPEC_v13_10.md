# みん会TCG Simulator v13.10 Remote API additions

v13.9仕様に加え、サーバー管理メインデッキの「上からX枚」確認を追加する。

## peek-top

入力:
```json
{
  "roomCode":"ABC123",
  "slot":1,
  "count":5,
  "sessionToken":"opaque-token"
}
```

出力例:
```json
{
  "peeked":["cardA","cardB","cardC","cardD","cardE"],
  "remaining":35,
  "deckSignature":"server-generated-opaque-signature"
}
```

要件:
- host=P1、guest=P2の自分側slotのみ許可。
- spectatorは禁止。
- `peeked` は所有者へのレスポンスにだけ含める。
- デッキ順は変更しない。
- `count` は1〜20に制限。
- `deckSignature` は確認時点のデッキ状態を識別できる不透明値でよい。

## commit-top-inspection

入力:
```json
{
  "roomCode":"ABC123",
  "slot":1,
  "peekedIds":["cardA","cardB","cardC","cardD","cardE"],
  "returnTop":["cardC","cardA"],
  "returnBottom":["cardE"],
  "deckSignature":"server-generated-opaque-signature",
  "sessionToken":"opaque-token"
}
```

意味:
- peekedIdsのうちreturnTop/returnBottomに含まれないカードはデッキ外へ移動したものとして確定する。
- returnTopは指定順でデッキ最上部へ戻す。
- returnBottomは指定順でデッキ最下部へ戻す。

サーバー処理:
1. セッション所有者とslotを検証。
2. 現在のデッキ状態が `deckSignature` と一致するか確認。
3. 現在の先頭 `peekedIds.length` 枚が `peekedIds` と完全一致するか確認。
4. returnTop + returnBottom が peekedIds の多重集合内であることを確認。
5. `rest = currentDeck.slice(peekedIds.length)`。
6. `next = returnTop + rest + returnBottom`。
7. server-only deck orderを `next` へ原子的に更新。
8. auditLogへ記録。

成功例:
```json
{
  "ok":true,
  "remaining":38,
  "deckSignature":"new-server-signature"
}
```

競合:
- 確認中にdraw/shuffle/別タブ操作等でデッキが変化していた場合はHTTP 409。
- クライアントはローカル盤面へ変更を反映せず、最初からやり直す。

## Security

- cardIdを相手・観戦者・通常room snapshotへ混入させない。
- `clientId`単独では権限判定しない。
- session tokenとroom roleをサーバー側で照合。
- commitはトランザクションまたは同等の排他/競合検出で原子的に行う。
