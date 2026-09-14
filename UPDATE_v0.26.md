# BUILD LAB v0.26 更新手順

## GitHub更新用ZIPを使う場合
1. `build_lab_update_v0.25_to_v0.26.zip` を展開します。
2. 展開した内容を、v0.25 のリポジトリ直下へそのまま上書きします。
3. `tests/run_checks.sh`（Windowsは `tests/run_checks.bat`）を実行します。
4. `All checks passed.` を確認してコミットしてください。

## 完全版ZIPを使う場合
`build_lab_v0.26_complete.zip` を展開し、`build_lab_v026/index.html` を開いてください。

## セーブ移行
v0.26 は `build_lab_proto_v26` を使用します。v0.25 の `build_lab_proto_v25` は旧キーとして自動読込され、内容を維持したままv0.26形式へ正規化されます。

## 主な注意
- 二面カードは手動反転ではありません。各実体が表面から始まり、固有条件達成後に裏面へ自動変化します。
- 変化後はその戦闘中は表面へ戻りません。
- 特殊個体の図鑑には未発見時から名前と発見条件が表示されます。
- 大アルカナは0「愚者」〜21「世界」の22枚です。
