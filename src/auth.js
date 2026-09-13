import http from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { google } from 'googleapis'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
export const CREDENTIALS_PATH = path.join(ROOT, 'credentials.json')
export const TOKEN_PATH = path.join(ROOT, 'token.json')

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
]

async function loadCredentials() {
  const raw = await readFile(CREDENTIALS_PATH, 'utf8')
  const { installed, web } = JSON.parse(raw)
  const creds = installed || web
  if (!creds) throw new Error('credentials.json missing "installed" or "web" client config')
  return creds
}

export async function getOAuthClient() {
  const { client_id, client_secret } = await loadCredentials()
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost')

  try {
    const token = JSON.parse(await readFile(TOKEN_PATH, 'utf8'))
    oAuth2Client.setCredentials(token)
    oAuth2Client.on('tokens', async (tokens) => {
      const merged = { ...token, ...tokens }
      await writeFile(TOKEN_PATH, JSON.stringify(merged, null, 2))
    })
    return oAuth2Client
  } catch {
    throw new Error('No token.json found. Run `npm run auth` first.')
  }
}

async function runAuthFlow() {
  const { client_id, client_secret } = await loadCredentials()

  const server = http.createServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  const redirectUri = `http://127.0.0.1:${port}`

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri)
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  })

  console.log('Open this URL and approve access:\n')
  console.log(authUrl)
  console.log('\nWaiting for redirect on', redirectUri, '...')

  const code = await new Promise((resolve, reject) => {
    server.on('request', (req, res) => {
      const url = new URL(req.url, redirectUri)
      const code = url.searchParams.get('code')
      const error = url.searchParams.get('error')
      res.end(error ? `Error: ${error}. You can close this tab.` : 'Authenticated. You can close this tab.')
      server.close()
      if (error) reject(new Error(error))
      else resolve(code)
    })
  })

  const { tokens } = await oAuth2Client.getToken(code)
  await writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2))
  console.log('\nSaved token to', TOKEN_PATH)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runAuthFlow().catch((err) => {
    console.error(err.message)
    process.exit(1)
  })
}
