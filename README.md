# 登記所備付地図データ 公共座標整理状況マップ

https://geolonia.github.io/chiban-zahyo-map/

法務省の[登記所備付地図データ](https://front.geospatial.jp/houmu-chiseki/)の公共座標整理状況を、都道府県、市区町村別に可視化した地図です

<img width="1201" alt="スクリーンショット 2023-02-09 14 40 37" src="https://user-images.githubusercontent.com/8760841/217733430-d8693ce8-aa06-440b-96e3-9406bddf71de.png">

データ集計に使用したスクリプトは以下のリポジトリをご覧下さい。  
https://github.com/geolonia/moj-counts


## 使用データ

- [「登記所備付データ」（法務省）](https://front.geospatial.jp/houmu-chiseki/)を加工して作成（数値以外で始まる地番住所は除外しています）
- [「国土数値情報（行政区域データ）」（国土交通省）](https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-v3_1.html)を加工して作成

