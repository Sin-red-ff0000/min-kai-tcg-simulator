# BUILD LAB v0.30 CODE TREE

## v0.27〜v0.30で追加・変更した主要責務
- `js/data/expansion27.js`：アルカナ/ルーン/元素/連結/特殊個体/複合挙動の横断コンテンツ。
- `js/data/unlocks27.js`：v0.27追加要素のアンロック。
- `js/data/expansion28.js`：条件負荷監査と高条件コンテンツの再調整。
- `js/data/expansion29.js`：敵特性で効果形状が変わる解析カード、追加二面カード。
- `js/data/unlocks29.js`：解析・二面カード系アンロック。
- `js/data/expansion30.js`：複合解析カード、3段階成長カード、成長支援要素。
- `js/data/unlocks30.js`：v0.30追加要素のアンロック。
- `js/core/battle.js`：解析分岐、条件変化、3段階成長、UID単位履歴を戦闘処理へ統合。
- `js/core/enemy.js`：追加特殊個体・複合挙動の判定補助。
- `js/ui/battleView.js`：解析モード・二面変化・成長段階を戦闘提示へ反映。
- `js/core/state.js`：v0.30セーブキーと旧セーブ自動移行。

## 専用回帰テスト
- `tests/expansion27_systems.test.js`
- `tests/expansion28_balance_audit.test.js`
- `tests/expansion29_adaptive.test.js`
- `tests/expansion30_growth.test.js`

`tests/run_checks.sh` / `tests/run_checks.bat` から通常回帰として実行されます。
