## crescent-asset-size-reporter

Reports size of asset bucket of mastodon instance every day.

### 簡単な仕組み

1. Cloudflare GraphQL API 経由で crescent のメディアバケットの総容量（`payloadSize`）を取得
1. 整形して Slack にメッセージをポスト

これを Cloudflare Workers の Cron Trigger で定期的に動かしているだけ

### gen-types

`.dev.vars` とか `wrangler.toml` に変更加えたときに binding の型情報を同期するやつ

```sh
$ npm run gen-types
```

### deploy

シークレット関連はあらかじめセットアップしておく

```sh
$ npx wrangler deploy
```
