const express = require("express");
const fs = require("fs");
const app = express();
const https = require('https');
const { parse } = require('json2csv');
const bodyParser = require('body-parser');
const csv = require('csvtojson');
const converter = csv({
    noheader: true,
    trim: true,
});
const port = process.env.PORT || 8080;
let drivers = [];
const fields = ['name', 'contact-phone', 'address', 'zip_code'];
const opts = { fields };
const usersStream = fs.createWriteStream('users.csv', { flags: 'a' });

(async function () {
    https.createServer({
        key: fs.readFileSync('./key.pem'),
        cert: fs.readFileSync('./cert.pem'),
        passphrase: 'perow59~'
    }, app)
        .listen(port);
    app.use(bodyParser.json())
    console.log("Server up and running at port: " + port);
    drivers += await csv().fromFile(csvFilePath);

})();
// GET method route
app.get('/', function (req, res) {
    let result = drivers.filter(obj => {
        return obj.zip_code === req.query.zip;
    });
    res.send(result);
})

// POST method route
app.post('/', function (req, res) {
    let result = drivers.filter(obj => obj.name === req.query.name && obj.address === req.query.address);
    if (result.length > 0) {
        res.send("POST sent duplicate driver");
        return;
    }
    drivers.push(req.query);
    res.send('POST added new driver');
    try {
        const csv = parse(req, opts);
        console.log(csv);
        usersStream.write(csv);
    } catch (err) {
        console.error(err);
    }

});
