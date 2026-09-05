みん会TCG Simulator Ver 26.0

オンライン盤面の読み込み時スクロール初期化を、復元回数を増やす方式ではなく
再描画構造そのものから修正しました。

主な修正

1. 不要な盤面全再描画を停止
- 2.5秒ごとのPollingで、ルーム内容が変わっていない場合はinnerHTMLを再生成しない。
- Realtime通知でも同じ内容なら盤面を作り直さない。
- 盤面/手札/カード状態の署名を比較し、実際に表示内容が変化した場合だけ再描画。

2. 二重・多重描画を整理
- onlineRemoteGetRoom()内でremote snapshotを適用した後、
  Polling側でさらにonlineRenderDuelBoard()を呼んでいた重複を削除。
- Realtime側の重複renderも削除。
- ロビー更新時に既に取得済みのroomを再度get-roomする経路も整理。
- ドロー後のremote取得と、その直後の追加renderの重複を削減。

3. onlineRenderDuelBoard()内の二重mergeを撤去
- remote snapshot適用時にだけ相手公開盤面をmerge。
- render関数は表示だけを担当する形に整理。

4. MutationObserver対策
- Simulator自身がinnerHTMLを再生成している間はMutationObserverを一時停止。
- 自分自身の描画更新を「ユーザーの盤面操作」と誤認して再同期する経路を抑制。

5. nav()のスクロール初期化対策
- 通常画面は従来通り先頭へ移動。
- オンライン盤面へ再接続するとき、保存済み位置がある場合はnav()でscrollTo(0,0)を実行しない。

6. 座標だけでなく表示アンカーを保存
- 現在見ているカード/ゾーンをアンカーとして記録。
- 読み込み後に盤面高さが変わっても、同じカード/ゾーンが同じ画面位置付近に来るよう補正。
- カードにはinstanceIdベースの安定したdata-online-anchorを付与。

7. レイアウト安定待ち
- 80ms/220ms/500msの決め打ちだけに依存する方式を廃止。
- 盤面サイズが複数フレーム連続で変化しなくなってから最終スクロール補正。

8. スクロール保存先を強化
- sessionStorageに加えてlocalStorageにもルーム別保存。
- スマホでタブ/PWAが再生成された場合にも復元できる可能性を高めた。

9. ブラウザ標準のスクロール復元との競合対策
- オンライン対戦中だけhistory.scrollRestorationをmanualへ変更。
- ロビーへ戻る際に元の設定へ復帰。

10. CSS scroll anchoring対策
- オンライン盤面と主要ゾーンにoverflow-anchor:noneを適用。
- DOM変更時のブラウザ自動補正とSimulator側の復元が競合しにくいようにした。

Ver25.9までの
- 手札保存/再接続復元
- 自分側の完全盤面キャッシュ
- 裏向きペインカウント復元
- デッキ作成詳細ボタン
- 公開所更新
も含みます。

Supabase側の変更はありません。
GitHubの index.html を上書きしてください。
