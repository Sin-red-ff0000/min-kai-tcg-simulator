# みん会TCG Simulator v13.9 Remote API additions

v13.8仕様に加え session token を導入。

create-room / join-room / watch-room 成功時:
```json
{"sessionToken":"opaque-token","room":{}}
```

以後クライアントは Authorization: Bearer <sessionToken> と payload.sessionToken を送信する。
clientId単独では権限判定しない。

追加 action:
- shuffle-deck
- 既存 draw
- 既存 random-pick

v13.9クライアントは get-room を約2.5秒間隔でpollする。
将来はWebSocket/SSE/Realtimeへ差し替える。
