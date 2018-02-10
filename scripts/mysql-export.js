const mysql = require('mysql')
const minimist = require('minimist')

const args = minimist(process.argv.slice(2))

const defaults = {
  username: '',
  password: '',
  mysqlHost: 'localhost',
  mysqlPort: 3306,
  mysqlDatabase: ''
}

const username = args.username || args.u || args._[0] || defaults.username
const password = args.password || args.p || args._[1] || defaults.password

if (!username || !password) {
  console.error('Username and password required')
  process.exit(1)
}

const mysqlHost = args.host || args.h || args._[2] || defaults.mysqlHost
const mysqlPort = args.port || args.p || args._[3] || defaults.mysqlPort
const database = args.database || args.db || args.d || args._[4] || defaults.mysqlDatabase

const conn = mysql.createConnection({
  host: mysqlHost,
  port: mysqlPort,
  user: username,
  password: password,
  database: database
})

conn.connect()

conn.end()
