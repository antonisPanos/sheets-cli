---
name: google-sheets
description: Read and write Google Sheets via a local OAuth CLI (sheets-cli). Use when the user asks to create, read, or edit a Google Sheet, spreadsheet, tab, cell range, or formula.
---

# Google Sheets via sheets-cli

For a personal (non-Workspace) Google account, no Google Sheets MCP
connector may be usable — the official one (`sheetsmcp.googleapis.com`)
is Developer Preview and Workspace-only. Instead use this local Node
CLI, authenticated via OAuth (`credentials.json` + `token.json`, both
gitignored), which talks to the Sheets API directly.

Set `SHEETS_CLI_DIR` to wherever this repo is cloned (e.g.
`~/dev/sheets-cli`), then run it with Bash, from anywhere, using the
absolute path:

```
node $SHEETS_CLI_DIR/src/cli.js <command> [args]
```

## Commands

- `create <title>` — new spreadsheet, prints id + URL
- `info <spreadsheetId>` — list tabs: sheetId, title, row/col count
- `get <spreadsheetId> <range>` — read values, e.g. `"Sheet1!A1:C10"`
- `set <spreadsheetId> <range> <valuesJson>` — write literal values, e.g. `'[["a","b"],["c","d"]]'`
- `set-formula <spreadsheetId> <range> <valuesJson>` — write with USER_ENTERED semantics (formulas evaluate)
- `add-tab <spreadsheetId> <title>` — insert a new tab, prints its sheetId
- `del-tab <spreadsheetId> <sheetId>` — delete a tab by numeric sheetId
- `insert-rows` / `insert-cols <spreadsheetId> <sheetId> <startIndex> <endIndex>` — 0-based, end exclusive

Run `node $SHEETS_CLI_DIR/src/cli.js help` for the live usage text.

## Notes

- The spreadsheet URL is `https://docs.google.com/spreadsheets/d/<spreadsheetId>/edit`.
- If a command fails with an auth/token error, tell the user to run
  `cd $SHEETS_CLI_DIR && npm run auth` again (token may have been revoked or expired).
- This CLI has no delete-file command — to delete a spreadsheet entirely,
  use Drive directly (web UI, `drive.google.com`, or a Drive API/MCP tool
  if one is available) to trash the file.
