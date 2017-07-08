const cool = require('cool-ascii-faces');
const express = require('express');
const pg = require('pg');
const http = require('http')
const fortune = require('fortune')
const fortuneHTTP = require('fortune-http')
const postgresAdapter = require('fortune-postgres')
const jsonApiSerializer = require('fortune-json-api')
const app = express();

const username = 'obnuflvuveexxj'
const password = '4362adcc7d7c35b4c502c40d7db0298d68c563fbd03cd7e6240295817ce44fd7'
const host = 'ec2-23-21-220-152.compute-1.amazonaws.com'
const port = '5432'
const db = 'dcbl123hop9rcv'
const store = fortune({
  // Fortune Configuration
}, {
  adapter: [
    postgresAdapter,
    {
      // options object, URL is mandatory.
      url: `postgres://${username}:${password}@${host}:${port}/${db}`
    }
  ]
})

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/cool', function(request, response) {
  response.send(cool());
});

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
