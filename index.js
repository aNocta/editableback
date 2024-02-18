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
    const {rows} = await sql(`SELECT * FROM main WHERE table_id=${tableId}`);
    console.log(rows);
    const db = JSON.parse(fs.readFileSync(dbFile, "utf-8"));
    const dbResponse = db.cells.filter(cell => cell.table_id == tableId);
    res.send(dbResponse);
})

app.post("/set_cell", urlencodedParser, (req, res) => {
    const db = JSON.parse(fs.readFileSync(dbFile, "utf-8"));
    const tableId = req.body.tableId;
    const row = req.body.row;
    const col = req.body.col;
    const value = req.body.value;
 
    const newBd = db.cells.map(cell => {

        console.log(cell);
        if(cell.table_id == tableId && cell.row == row && cell.col == col)
            return {
                table_id: tableId,
                row,
                col,
                value
            }
        return cell;
    });
    fs.writeFileSync(dbFile, JSON.stringify({cells: newBd}));
    res.send(200);
});

app.post("/mass_set_cell", urlencodedParser, (req, res) => {
    const db = JSON.parse(fs.readFileSync(dbFile, "utf-8"));
    const massEdit = req.body.mass;
    console.log([req.body]);

    const newBd = db.cells.map(cell => {
        let res;
        
        massEdit.forEach(m => {
            if(cell.table_id == m.table_id && cell.row == m.row && cell.col == m.col){
                res = {
                    table_id: m.table_id,
                    row: m.row,
                    col: m.col,
                    value: m.value
                }
            }
        });
        if(res) return res;
        return cell;
    });
    fs.writeFileSync(dbFile, JSON.stringify({cells: newBd}));
    res.send(200);
});
app.listen(3000);
