みん会TCG Simulator Ver 26.5

相手・観戦時のデッキ枚数が0枚固定になる問題を、取得優先順位から修正しました。

Ver26.4で上手く直らなかった原因
- Supabaseのルーム応答では、相手や観戦者から見た p1 / p2 の deckCount が
  秘匿用の値として 0 になる経路があります。
- Ver26.4では room.p1/p2.deckCount を publicState.meta.deckCount より先に見ていました。
- そのため publicState に正しい残り枚数が入っていても、先に見つかった秘匿用の0を
  「本当に0枚」と判断してしまい、公開枚数へフォールバックできていませんでした。

Ver26.5の修正
- 自分のデッキ枚数:
  server側の自分用 deckCount を最優先。
- 相手・観戦者から見たデッキ枚数:
  publicState.p1/p2.meta.deckCount を最優先。
- 相手側の room.p1/p2.deckCount が0の場合は、公開枚数が無い限り
  「秘匿用0の可能性がある値」として扱い、先に採用しません。
- 公開盤面のdeckCountが0なら、その0は実際のデッキ切れとして扱います。
- 対戦開始直後、server deckCountがまだ0でも端末上にデッキ実カードが残っている場合は、
  誤った0枚をpublicStateへ公開しないよう補正。
- onlinePublishOwnPublicBoard側にもdeckCount送信を追加。
  Ver26.4ではautoSync経路だけにdeckCountがあり、別の公開同期経路で抜けていました。
- オンライン盤面の再描画判定も、秘匿用のraw deckCountではなく
  実際に画面へ表示する解決済みdeckCountを使うよう変更。

デッキのカード内容・ID・順番はこれまで通り相手・観戦者には公開しません。
公開されるのは残り枚数だけです。

Supabase SQL / Edge Functionの変更は不要です。
GitHubの index.html を上書きしてください。
