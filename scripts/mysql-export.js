const mysql = require('mysql')
const minimist = require('minimist')
const fs = require('fs')

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
  user: username,
  password: password,
  database: database
})

conn.connect()

const getTables = () => new Promise((resolve, reject) => {
    conn.query('SHOW TABLES', (err, results, fields) => {
        if (err) { return reject(err) }
        const field = fields[0].name;
        const tables = results.map(result => result[field])
        resolve(tables)
    })
})

const getPosts = () => new Promise((resolve, reject) => {
    conn.query('SELECT * FROM wp_posts', (err, results, fields) => {
        if (err) { return reject(err) }
        resolve(results)
    })
})

getPosts()
    .then(posts => new Promise((resolve) => {
        fs.writeFile('./posts.json', JSON.stringify(posts, null, 2), resolve)
    }))

conn.end()
