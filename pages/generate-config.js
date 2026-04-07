// generate-config.js
const { readFileSync, writeFileSync } = require('fs')

const env = Object.fromEntries(
  readFileSync('.env', 'utf-8')
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => line.split('=').map(s => s.trim()))
)

const config = `// AUTO-GENERIERT – nicht einchecken!
export const SUPABASE_URL = '${env.SUPABASE_URL}';
export const SUPABASE_KEY = '${env.SUPABASE_KEY}';
`

writeFileSync('Frontend/config.js', config)
console.log('✅ config.js generiert')