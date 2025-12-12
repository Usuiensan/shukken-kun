# 出典くん

ページのタイトル、URL、アクセス日を簡単にコピーするChrome拡張機能です。
[Chromeウェブストアから入手](https://chromewebstore.google.com/detail/%E5%87%BA%E5%85%B8%E3%81%8F%E3%82%93/kjlnbjeohfbpcjhjejbefejogkfdnklg)
## 機能

*   閲覧中のページのタイトル、URL、アクセス日時をクリップボードにコピーします。

## インストール方法

1.  このリポジトリをクローンまたはダウンロードします。
2.  Chromeブラウザで拡張機能ページ (`chrome://extensions`) を開きます。
3.  「デベロッパーモード」を有効にします。
4.  「パッケージ化されていない拡張機能を読み込む」をクリックし、このフォルダを選択します。

## 使い方

1.  情報をコピーしたいウェブページを開きます。
2.  ブラウザのツールバーにある「出典くん」のアイコンをクリックします。
3.  情報がクリップボードにコピーされます。

## ファイル構成

*   `manifest.json`: 拡張機能の設定ファイル
*   `popup.html` / `popup.js`: ポップアップウィンドウのHTMLとJavaScript
*   `options.html`: オプションページのHTML
*   `background.js`: バックグラウンドで動作するスクリプト
*   `images/`: アイコン画像
    *   `icon16.png`
    *   `icon48.png`
    *   `icon128.png`

## ライセンス
このソフトウェアはMITライセンスに基づいて公開されています。詳しくは[こちら](/LICENSE)
