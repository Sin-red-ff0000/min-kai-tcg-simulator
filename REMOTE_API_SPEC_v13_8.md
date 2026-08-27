# みん会TCG Simulator v13.8 Remote API Contract

クライアントは `POST <Endpoint>` に JSON を送信する。
共通形式:

```json
{
  "action": "create-room",
  "payload": {},
  "projectId": "minkai-tcg"
}
```

サーバーは成功時 `200` + JSON を返す。
ルーム系レスポンスは原則として以下のどちらか。

```json
{ "room": { "...": "sanitized room state" }, "clientId": "..." }
```

または room オブジェクトそのもの。

重要:
- `serverOnlyState` のデッキ順は通常クライアントへ返さない。
- P1にはP2の owner-only 情報を返さない。
- P2にはP1の owner-only 情報を返さない。
- 観戦者には owner-only / server-only を一切返さない。
- auditLog はサーバー側を正本とする。
- shuffle / random / draw はサーバー側で実行する。

## actions

### ping
入力:
```json
{"at": 0}
```

### create-room
入力:
```json
{"clientId":"...","requestedRole":"host"}
```
出力:
- room
- clientId

### join-room
入力:
```json
{"code":"ABC123","role":"guest","clientId":"..."}
```

### watch-room
入力:
```json
{"code":"ABC123","role":"spectator","clientId":"..."}
```

### heartbeat
入力:
```json
{"roomCode":"ABC123","clientId":"...","role":"host|guest|spectator"}
```
出力:
- sanitized room snapshot

### get-room
入力:
```json
{"roomCode":"ABC123","clientId":"...","role":"host|guest|spectator"}
```

### leave-room
入力:
```json
{"roomCode":"ABC123","clientId":"...","role":"host|guest|spectator"}
```

### player-setup
入力:
```json
{
  "roomCode":"ABC123",
  "clientId":"...",
  "role":"host|guest",
  "ready":true,
  "deckId":"...",
  "deckName":"...",
  "deckTotal":40,
  "oshiiCardId":"...",
  "deckHash":"...",
  "lockedDeck":{"entries":[]}
}
```
lockedDeck はサーバー内部で server-only deck order 作成に利用し、
相手や観戦者へ返さない。

### start-match
入力:
```json
{"roomCode":"ABC123","clientId":"..."}
```
ホストのみ許可。

### sync-public-board
入力:
```json
{
  "roomCode":"ABC123",
  "clientId":"...",
  "slot":1,
  "publicBoard":{},
  "revision":12
}
```
P1はslot 1、P2はslot 2のみ更新可。

### shuffle
入力:
```json
{"cardIds":["a","b","c"],"roomCode":"ABC123"}
```

### random-pick
入力:
```json
{"candidateIds":["a","b","c"],"count":1,"roomCode":"ABC123"}
```

### set-deck-order
入力:
```json
{"roomCode":"ABC123","slot":1,"cardIds":["..."]}
```
通常クライアントへ順序を返さないこと。

### draw
入力:
```json
{"roomCode":"ABC123","slot":1,"count":1}
```
返却される `drawn` は所有者にのみ返す。

### deck-count
入力:
```json
{"roomCode":"ABC123","slot":1}
```
枚数のみ返す。

## Security requirements
- clientIdだけを信用して権限判定しない。
- 実運用ではroom session token等を発行する。
- host / guest / spectator権限はサーバー側で固定する。
- shuffle/randomには暗号学的乱数を使用する。
- auditLogはクライアント要求で削除・改変不可。
- room更新にはrevisionまたはサーバー時刻による競合制御を入れる。
