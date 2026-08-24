みん会TCG Simulator v1.0 PWA版

内容
- index.html : シミュレーター本体
- manifest.webmanifest : PWA設定
- sw.js : オフライン用Service Worker
- icons/ : ホーム画面アイコン

重要
PWA機能は、Documentsなどから index.html を直接開く file:// 方式では動作しません。
HTTPSで公開したURLから一度開く必要があります。

使い方
1. このフォルダの中身を、そのまま同じ階層構成でWebホスティングへアップロードします。
2. iPhoneのSafariで公開URLの index.html を開きます。
3. 共有ボタン → ホーム画面に追加 を選びます。
4. 追加された「みん会TCG」アイコンから起動します。
5. 一度正常に読み込んだ後は、Service Workerのキャッシュによりオフラインでも起動できます。

更新時
新しいバージョンを同じURLへアップロードすると、オンラインで開いた際に最新版の取得を試みます。
古いService Workerキャッシュはバージョン変更時に削除される構成です。

保存データ
カード・デッキはブラウザ/PWA側のlocalStorageへ保存されます。
Documents版など別の環境からは自動で引き継がれません。
移行時はシミュレーター内の「全データをバックアップ」でJSONを作成し、
PWA版で「バックアップから復元」を使ってください。

対戦中の盤面状態はバックアップ対象外です。
