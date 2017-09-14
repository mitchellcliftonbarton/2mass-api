const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const uuid = require('uuid/v5')
const pg = require('pg')
const http = require('http')
const fortune = require('fortune')
const fortuneHTTP = require('fortune-http')
const postgresAdapter = require('fortune-postgres')
const jsonApiSerializer = require('fortune-json-api')
const app = express();

/**** Constants ****/

const UUID_NAMESPACE = '9b2481a9-4cd1-4bbe-a0a7-4f7cfb8bbbb3'

/**** Options for Cors ****/

const corsOptions = {
  origin: 'http://localhost:4200',
  // origin: 'http://poop.mitchellbarton.com/',
  optionsSuccessStatus: 200
}

/**** Enables pre-flight requests ****/

app.use(cors())
app.options('*', cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**** Database Info ****/

// Get the database URL from the environment.
// **Note**: The DB credentials shouldn’t be hard-coded and committed to source-control, so we get
// the database URL from the `DATABASE_URL` environment variable. Also, Heroku can change the
// credentials at any time, so it’s essential that they be determined dynamically. For local
// development, use `npm run local`, which will set `DATABASE_URL` using the Heroku Toolbelt.
const databaseURL = process.env.DATABASE_URL

/**** Record Types / Models ****/

const recordTypes = {
  show: {
    title: String,
    when: String,
    link: String,
    status: String,
    text: String,
    images: [ Array('image'), 'show' ],
    pieces: [ Array('piece'), 'show' ],
    people: [ Array('person'), 'show' ]
  },
  image: {
    show: [ 'show', 'images' ],
    url: String,
    title: String
  },
  person: {
    name: String,
    show: [ 'show', 'people' ],
    pieces: [ Array('piece'), 'person' ]
  },
  piece: {
    title: String,
    show: [ 'show', 'pieces' ],
    person: [ 'person', 'pieces' ]
  }
}

/**** The Postgres Adapter ****/

const adapter = [ postgresAdapter, {
  url: `${databaseURL}?ssl=true`,
  generatePrimaryKey: () => uuid(Date.now().toString(), UUID_NAMESPACE)
}]

/**** Fortune Instance ****/

const store = fortune(recordTypes, { adapter })

/**** HTTP stuff ****/

const listener = fortuneHTTP(store, {
  serializers: [
    [ jsonApiSerializer ]
  ]
});

/**** Index Route ****/

app.get('/', function(req, res, next) {
  res.send('Stuff!');
});

/**** Login Token ****/

app.post('/api/token', cors(corsOptions), function(req, res) {
  console.log('trying to log in');
  if (req.body.grant_type === 'password') {
    if (req.body.username === 'letme' && req.body.password === 'in!') {
      res.status(200).send('{ "access_token": "secret token!" }');
      console.log('someone logged in!');
    } else {
      res.status(400).send('{ "error": "Invalid username or password" }');
      console.log('someone failed to log in with the wrong password!');
    }
  } else {
    res.status(400).send('{ "error": "Unsupported Grant Type" }');
    console.log('someone failed to log in!');
  }
  console.log('this is the request body ' + req.body);
});

module.exports = app;

/**** This is how fortune listens to the server i think? ****/

app.use('/api', (request, response) =>
  listener(request, response).catch(error => console.log(error))
)

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
