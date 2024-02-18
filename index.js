const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");
const {sql} = require("@vercel/postgres")

const app = express();

const urlencodedParser = bodyParser.urlencoded({extended: false});
const dbFile = path.join(process.cwd(), "tmp", "db.json");

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/cells", async (req, res) => {
    const tableId = req.query.table_id;
    const {rows} = await sql`SELECT * FROM main WHERE table_id=${tableId}`;
    res.send(rows);
})

app.post("/set_cell", urlencodedParser, async (req, res) => {
    const tableId = req.body.tableId;
    const row = req.body.row;
    const col = req.body.col;
    const value = req.body.value;

    await sql`UPDATE main SET value=${value} WHERE row=${row} AND col=${col} AND table_id=${tableId}`;
    res.send(200);
});

app.post("/mass_set_cell", urlencodedParser, async (req, res) => {
    const massEdit = req.body.mass;
     massEdit.forEach(m => {
         await sql`UPDATE main SET value=${m.value} WHERE row=${m.row} AND col=${m.col} AND table_id=${m.table_id}`;
        });
    res.send(200);
});
app.listen(3000);
