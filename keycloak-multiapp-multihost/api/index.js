var express = require("express")
var app = express()
var session = require('express-session');
var bodyParser = require('body-parser');
var Keycloak = require('keycloak-connect');
var cors = require('cors')
var db = require("./db.js")
var md5 = require("md5")

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

var HTTP_PORT = 27000

var memoryStore = new session.MemoryStore();

app.use(session({
  secret: 'some secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

var keycloak = new Keycloak({
  store: memoryStore
});

app.use(keycloak.middleware());

// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});

app.get("/api/comments", keycloak.enforcer('comments:read', {response_mode: 'permissions'}), (req, res, next) => {
    console.log('GET /api/comments');
    var sql = "select * from comment"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});


app.get("/api/comment/:id", keycloak.protect('scopes:read'), (req, res, next) => {
    console.log(`GET /api/comments/${req.params.id}`);
    var sql = "select * from comment where id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
});


app.post("/api/comment/", keycloak.protect('scopes:write'), (req, res, next) => {
    console.log(`POST /api/comments`);
    var errors=[]
    if (!req.body.password){
        errors.push("No password specified");
    }
    if (!req.body.email){
        errors.push("No email specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        name: req.body.name,
        email: req.body.email,
        password : md5(req.body.password)
    }
    var sql ='INSERT INTO comment (name, email, password) VALUES (?,?,?)'
    var params =[data.name, data.email, data.password]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})



app.patch("/api/comment/:id", keycloak.protect('scopes:write'), (req, res, next) => {
    console.log(`PATCH /api/comments/${req.params.id}`);
    var data = {
        name: req.body.name,
        email: req.body.email,
        password : req.body.password ? md5(req.body.password) : undefined
    }
    db.run(
        `UPDATE comment set
           name = coalesce(?,name),
           email = COALESCE(?,email),
           password = coalesce(?,password)
           WHERE id = ?`,
        [data.name, data.email, data.password, req.params.id],
        (err, result) => {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                data: data
            })
    });
})


app.delete("/api/comment/:id", keycloak.protect('scopes:delete') ,(req, res, next) => {
    console.log(`DELETE /api/comments/${req.params.id}`);
    db.run(
        'DELETE FROM comment WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", rows: this.changes})
    });
})


// Root path
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});
