#!/usr/bin/env node
import { google } from 'googleapis'
import { getOAuthClient } from './auth.js'

function usage() {
  console.log(`sheets-cli <command> [args]

  create <title>
      Create a new spreadsheet. Prints its id and URL.

  info <spreadsheetId>
      List sheet/tab names, ids, and grid size.

  get <spreadsheetId> <range>
      Read values, e.g. get abc123 "Sheet1!A1:C10"

  set <spreadsheetId> <range> <valuesJson>
      Write literal values, e.g. set abc123 "Sheet1!A1:B2" '[["a","b"],["c","d"]]'

  set-formula <spreadsheetId> <range> <valuesJson>
      Write values/formulas with USER_ENTERED semantics, e.g.
      set-formula abc123 "Sheet1!C1" '[["=SUM(A1:B1)"]]'

  add-tab <spreadsheetId> <title>
      Insert a new sheet/tab.

  del-tab <spreadsheetId> <sheetId>
      Delete a sheet/tab by its numeric sheetId (see 'info').

  insert-rows <spreadsheetId> <sheetId> <startIndex> <endIndex>
  insert-cols <spreadsheetId> <sheetId> <startIndex> <endIndex>
      Insert rows/columns. Indexes are 0-based, end is exclusive.
`)
}

async function getSheets() {
  const auth = await getOAuthClient()
  return google.sheets({ version: 'v4', auth })
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2)

  if (!cmd || cmd === 'help' || cmd === '--help') {
    usage()
    return
  }

  const sheets = await getSheets()

  switch (cmd) {
    case 'create': {
      const [title] = args
      if (!title) throw new Error('usage: create <title>')
      const res = await sheets.spreadsheets.create({
        requestBody: { properties: { title } },
      })
      console.log('id:', res.data.spreadsheetId)
      console.log('url:', res.data.spreadsheetUrl)
      break
    }

    case 'info': {
      const [spreadsheetId] = args
      if (!spreadsheetId) throw new Error('usage: info <spreadsheetId>')
      const res = await sheets.spreadsheets.get({ spreadsheetId })
      console.log('title:', res.data.properties.title)
      for (const s of res.data.sheets) {
        const p = s.properties
        console.log(`  sheetId=${p.sheetId}  title="${p.title}"  rows=${p.gridProperties?.rowCount}  cols=${p.gridProperties?.columnCount}`)
      }
      break
    }

    case 'get': {
      const [spreadsheetId, range] = args
      if (!spreadsheetId || !range) throw new Error('usage: get <spreadsheetId> <range>')
      const res = await sheets.spreadsheets.values.get({ spreadsheetId, range })
      console.log(JSON.stringify(res.data.values ?? [], null, 2))
      break
    }

    case 'set':
    case 'set-formula': {
      const [spreadsheetId, range, valuesJson] = args
      if (!spreadsheetId || !range || !valuesJson) {
        throw new Error(`usage: ${cmd} <spreadsheetId> <range> <valuesJson>`)
      }
      const values = JSON.parse(valuesJson)
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      })
      console.log('ok')
      break
    }

    case 'add-tab': {
      const [spreadsheetId, title] = args
      if (!spreadsheetId || !title) throw new Error('usage: add-tab <spreadsheetId> <title>')
      const res = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: [{ addSheet: { properties: { title } } }] },
      })
      console.log('sheetId:', res.data.replies[0].addSheet.properties.sheetId)
      break
    }

    case 'del-tab': {
      const [spreadsheetId, sheetIdRaw] = args
      if (!spreadsheetId || !sheetIdRaw) throw new Error('usage: del-tab <spreadsheetId> <sheetId>')
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: [{ deleteSheet: { sheetId: Number(sheetIdRaw) } }] },
      })
      console.log('ok')
      break
    }

    case 'insert-rows':
    case 'insert-cols': {
      const [spreadsheetId, sheetIdRaw, startRaw, endRaw] = args
      if (!spreadsheetId || !sheetIdRaw || !startRaw || !endRaw) {
        throw new Error(`usage: ${cmd} <spreadsheetId> <sheetId> <startIndex> <endIndex>`)
      }
      const dimension = cmd === 'insert-rows' ? 'ROWS' : 'COLUMNS'
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            insertDimension: {
              range: {
                sheetId: Number(sheetIdRaw),
                dimension,
                startIndex: Number(startRaw),
                endIndex: Number(endRaw),
              },
              inheritFromBefore: false,
            },
          }],
        },
      })
      console.log('ok')
      break
    }

    default:
      usage()
      process.exitCode = 1
  }
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
