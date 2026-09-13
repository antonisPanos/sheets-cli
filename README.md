# sheets-cli

Local CLI for reading/writing Google Sheets on a personal Google account,
via OAuth — no MCP, no Workspace requirement.

> **Why this exists:** at time of writing, no Google Sheets MCP server
> existed for a personal (non-Workspace) Google account. This CLI is a
> workaround — a thin OAuth + Sheets API wrapper — until an MCP option
> is available.

## Setup

1. **Create a Google Cloud project** (or reuse one) at
   [console.cloud.google.com](https://console.cloud.google.com).
2. **Enable the Google Sheets API** (and Google Drive API, used for
   creating spreadsheets) for that project under
   *APIs & Services > Library*.
3. **Configure the OAuth consent screen** (*APIs & Services > OAuth
   consent screen*) — External user type is fine for personal use; add
   your own Google account as a test user.
4. **Create an OAuth client ID** (*APIs & Services > Credentials >
   Create Credentials > OAuth client ID*), application type
   **Desktop app**. Download the JSON and save it as `credentials.json`
   in this project's root.
5. Install dependencies:
   ```
   npm install
   ```
6. Run the auth flow once — opens a browser, you approve access, a
   `token.json` is saved locally:
   ```
   npm run auth
   ```

`credentials.json` and `token.json` are gitignored — never committed.
Each person who clones this repo needs their own OAuth client and their
own token.

## Usage

```
node src/cli.js help
```

Commands: `create`, `info`, `get`, `set`, `set-formula`, `add-tab`,
`del-tab`, `insert-rows`, `insert-cols`.

## Claude Skill

This CLI is meant to be driven by an agent through a Claude Code skill —
see [`docs/SKILL.md`](docs/SKILL.md). The skill tells the agent when to
reach for this tool (creating/reading/editing a Sheet, tab, range, or
formula) and documents every CLI command it's allowed to call
(`create`, `info`, `get`, `set`, `set-formula`, `add-tab`, `del-tab`,
`insert-rows`, `insert-cols`), plus what to do on an auth/token error.

To use it yourself: drop `docs/SKILL.md` into your skills directory
(e.g. `~/.claude/skills/google-sheets/SKILL.md`) and set
`SHEETS_CLI_DIR` to wherever you clone this repo.

## License

MIT — see [LICENSE](LICENSE).
