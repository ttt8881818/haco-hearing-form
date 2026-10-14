# GAS版ヒアリングフォーム 自動デプロイ手順

`main` に `gas/` 配下の変更が push されると、GitHub Actions が `clasp push` → `clasp deploy` を実行し、
WebアプリのURLはそのままで最新コードが反映されます。

## 初回セットアップ（1回だけ）

1. https://script.google.com/home/usersettings で **Google Apps Script API** をオン
2. ローカルで `npm i -g @google/clasp` → `clasp login`（`~/.clasprc.json` ができる）
3. `clasp create --type webapp --title "ハコリノベ ヒアリングフォーム" --rootDir gas`
   → `.clasp.json` の `scriptId` を控える（`.clasp.json` はコミットしない）
4. `clasp push --force` → `clasp deploy` → `clasp deployments` で **Deployment ID**（`AKfycb...`）を控える
5. GASエディタ ▸ プロジェクトの設定 ▸ スクリプトプロパティに `NOTION_TOKEN` を登録
6. GitHub ▸ Settings ▸ Secrets and variables ▸ Actions に登録
   - `CLASPRC_JSON` : `~/.clasprc.json` の中身すべて
   - `GAS_SCRIPT_ID` : 手順3のスクリプトID
   - `GAS_DEPLOYMENT_ID` : 手順4のデプロイID

以降は `gas/` を編集して `main` にマージするだけで自動反映されます。
