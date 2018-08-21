var express = require('express'),
    serveStatic = require('serve-static'),
    winston = require('winston'),
    expressWinston = require('express-winston'),
    fs = require('fs'),
    https = require('https'),
    http = require('http'),
    sslKey  = fs.readFileSync(process.env.SSL_KEY_PATHNAME || './src/_assets/data/private_key.pem'),
    sslCertificate = fs.readFileSync(process.env.SSL_CERT_PATHNAME || './src/_assets/data/self_signed_cert.pem'),
    // frameguard = require('frameguard'),
    helmet = require('helmet');

var httpscredentials = {key: sslKey, cert: sslCertificate, secureOptions: require('constants').SSL_OP_NO_TLSv1};
var app = express();

app.all('*', ensureSecure);

// app.use(frameguard({ action: 'sameorigin' }));
// app.use(frameguard());

app.use(helmet());
app.use(helmet.frameguard({ action: 'sameorigin' }));
app.use(helmet.hsts({ maxAge: 31536000 })); // Overriding Value, Default was: 15552000

process.argv.forEach(function(val, index, array) {
    //console.log(index + ': ' + val);
});

app.set('port_http', (process.env.PORT || 8080));

app.set('port_https', (process.env.PORT_HTTPS || 8443));

if (process.env.GULP !== undefined) {
    app.use(expressWinston.logger({
        transports: [
            new winston.transports.Console({
                json: true,
                colorize: true,
                'timestamp': true
            })
        ],
        meta: true, // optional: control whether you want to log the meta data about the request (default to true)
        msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
        expressFormat: true, // Use the default Express/morgan request formatting, with the same colors. Enabling this will override any msg and colorStatus if true. Will only output colors on transports with colorize set to true
        colorStatus: true, // Color the status code, using the Express/morgan color palette (default green, 3XX cyan, 4XX yellow, 5XX red). Will not be recognized if expressFormat is true
        ignoreRoute: function(req, res) {
                return false;
            } // optional: allows to skip some log messages based on request and/or response
    }));
}

app.use(serveStatic('dist/', {
    'index': ['index.html']
}));

app.use(function(req, res) {
    res.sendFile(__dirname + '/dist/index.html');
});

http.createServer(app).listen(app.get('port_http'));

https.createServer(httpscredentials, app).listen(app.get('port_https'));

function ensureSecure(req, res, next){
    if(!req.secure){
      return res.redirect('https://' + req.hostname+':'+ app.get('port_https')+ req.url);
    };
    next();
};
