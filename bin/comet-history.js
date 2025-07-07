#!/usr/bin/env node
// bin/command-history.js

const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

// where we store our JSON map of absolute-dir → [cmd,…]
const DB_PATH = path.join(
  os.homedir(),
  '.config',
  'command-history',
  'data.json'
)

async function loadDB() {
  await fs.ensureFile(DB_PATH)
  const txt = await fs.readFile(DB_PATH, 'utf8')
  return txt.trim() ? JSON.parse(txt) : {}
}

async function saveDB(db) {
  await fs.outputFile(DB_PATH, JSON.stringify(db, null, 2))
}

async function main() {
  const argv = yargs(hideBin(process.argv))
    .scriptName('command-history')
    .command(
      'record <dir> <cmd>',
      'Record a command under a directory',
      () => {},
      async ({ dir, cmd }) => {
        const db = await loadDB()
        const abs = path.resolve(dir)
        db[abs] = db[abs] || []
        if (!db[abs].includes(cmd)) {
          db[abs].push(cmd)
          await saveDB(db)
        }
      }
    )
    .command(
      ['ls [base]', 'list [base]'],
      'List recorded commands under base (cwd if omitted)',
      () => {},
      async ({ base }) => {
        const db = await loadDB()
        // 1) determine and normalize root
        const raw = path.resolve(base || process.cwd())
        const { root: driveRoot } = path.parse(raw)
        let root
        if (driveRoot === raw) {
          // on Windows drive-root (“D:\”), keep the trailing slash
          root = driveRoot
        } else {
          // strip any trailing separator on normal dirs
          root = raw.endsWith(path.sep) ? raw.slice(0, -1) : raw
        }
        const withSep = root.endsWith(path.sep) ? root : root + path.sep

        // 2) pick only keys equal to root or nested under it
        const entries = Object.entries(db)
          .filter(([dir]) => dir === root || dir.startsWith(withSep))
          .sort(([a], [b]) => a.localeCompare(b))

        // 3) for each, build the “A -> B -> C” chain
        for (const [dir, cmds] of entries) {
          // rel path from root, split into segments
          const rel = path.relative(root, dir)
          const parts = rel ? rel.split(path.sep).filter(Boolean) : []
          const baseName = path.basename(root) // e.g. “test-1”
          // if we have a basename, prefix it
          const chain = baseName ? [baseName, ...parts] : parts
          if (chain.length === 0) chain.push('.') // the root itself
          console.log(chain.join(' -> ') + ' -> ' + cmds.join(' | '))
        }
      }
    )
    .demandCommand(1)
    .help()
    .argv
}

main()