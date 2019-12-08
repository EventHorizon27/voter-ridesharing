const express = require("express");
const fs = require("fs");
const app = express();
const https = require('https');
const { parseAsync } = require('json2csv');
const bodyParser = require('body-parser');
const csv = require('csvtojson');
const port = process.env.PORT || 8080; //default to port 8080, but uses https, doesn't work on 443
let drivers = [];
const fields = ['name', 'contact-phone', 'time', 'address', 'zip_code'];
const opts = { fields };
const usersStream = fs.createWriteStream('users.csv', { flags: 'a' });

(async function () {
    https.createServer({
        key: fs.readFileSync('./ssh/key.pem'),
        cert: fs.readFileSync('./ssh/cert.pem'),
        passphrase: 'perow59~'
    }, app)
        .listen(port);//load certificate and create secure server
    app.use(bodyParser.json());//setup parser
    console.log("Server up and running at port: " + port);
    try {
        let driver = await csv().fromFile("users.csv");//load existing users
        drivers.push(...driver);//convert to array and push to existing array, push used to keep any
    } catch (error) {
        console.error(error);
    }
    console.log(drivers);
})();
// GET method route
app.get('/', function (req, res) {
    let result = drivers.filter(obj => {//find all drivers in same zip code
        return obj.zip_code === req.query.zip;
    });
    res.send(result);//return all drivers found
})

// POST method route
app.post('/', function (req, res) { //add new driver
    let result = drivers.filter(obj => obj.name === req.query.name && obj.address === req.query.address); //check if there are any drivers with same address and name
    if (result.length > 0) { //if the array of those drivers contains any drivers send message and exit
        res.send("POST sent duplicate driver");
    }
    else { 
        drivers.push(req.query);//add the new driver to the array of drivers
        res.send('POST added new driver');
        parseAsync(req.query, opts)//async convert the json data of the new driver to csv data
            .then(csv => {
                usersStream.write(csv + "\n");//add new driver to restore file
            })
            .catch(err => console.error(err));
    }
});
