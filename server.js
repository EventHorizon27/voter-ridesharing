const express = require("express");
const fs = require("fs");
const app = express();
const https = require('https');
const bodyParser = require('body-parser')
const port = process.env.PORT || 8080;
let drivers = [];

(async function () {
    https.createServer({
        key: fs.readFileSync('./key.pem'),
        cert: fs.readFileSync('./cert.pem'),
        passphrase: 'perow59~'
    }, app)
        .listen(port);
    app.use(bodyParser.json())
    console.log("Server up and running at port: " + port);
})();
// GET method route
app.get('/', function (req, res) {
    let result = drivers.filter(obj => {
        return obj.zip_code === req.query.zip;
    })
    res.send(result);
})

// POST method route
app.post('/', function (req, res) {
    drivers.push(req.query);
    res.send('POST added new driver');
});
