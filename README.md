# sheets-cli

Local CLI for reading/writing Google Sheets on a personal Google account,
via OAuth — no MCP, no Workspace requirement.

## Setup

1. Create a **Desktop app** OAuth client in the Google Cloud console
   (project `claude-tools-506118`), download the JSON, save it as
   `credentials.json` in this folder.
2. `npm install`
3. `npm run auth` — opens a browser, approves access, saves `token.json`.

## Usage

```
node src/cli.js help
```

Commands: `create`, `info`, `get`, `set`, `set-formula`, `add-tab`,
`del-tab`, `insert-rows`, `insert-cols`.
