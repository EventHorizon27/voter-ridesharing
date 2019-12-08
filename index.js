var http = require('http'),
    fs = require('fs');

fs.readFile('./Reg1.html', function(err, html) {
    if (err) {
        throw err;
    }
    http.createServer(function(request, response){
        response.writeheader(200, {"Content-Type":"text/html"});
        response.write(html);
        response.end();
    }).listen(8000);
});