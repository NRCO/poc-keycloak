var sqlite3 = require('sqlite3').verbose()
var md5 = require('md5')

const DBSOURCE = "db.sqlite"


let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQlite database.')
        db.run(`CREATE TABLE comment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            body text
            )`,(err) => {
        if (err) {
            // Table already created
        } else {
            // Table just created, creating some rows
            var insert = 'INSERT INTO comment (body) VALUES (?)'
            db.run(insert, ["commentaire 1"])
            db.run(insert, ["commentaire 2"])
        }
    })
    }
})


module.exports = db
