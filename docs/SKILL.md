---
name: google-sheets
description: Read and write Google Sheets (personal Google account) via a local OAuth CLI at ~/dev/sheets-cli. Use when the user asks to create, read, or edit a Google Sheet, spreadsheet, tab, cell range, or formula.
---

# Google Sheets via sheets-cli

No Google Sheets MCP connector is usable here — the official one
(`sheetsmcp.googleapis.com`) is Developer Preview and Google Workspace-only;
the user's account is personal Gmail. Instead there is a local Node CLI at
`~/dev/sheets-cli` authenticated via OAuth (`credentials.json` + `token.json`,
both gitignored) that talks to the Sheets API directly.

Run it with Bash, from anywhere, using the absolute path:

```
node ~/dev/sheets-cli/src/cli.js <command> [args]
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

Run `node ~/dev/sheets-cli/src/cli.js help` for the live usage text.

## Notes

- The spreadsheet URL is `https://docs.google.com/spreadsheets/d/<spreadsheetId>/edit`.
- If a command fails with an auth/token error, tell the user to run
  `cd ~/dev/sheets-cli && npm run auth` again (token may have been revoked or expired).
- To delete a spreadsheet entirely, use the Google Drive MCP connector's
  `trash_file` (moves to trash, not permanent) — this CLI has no delete-file command.
