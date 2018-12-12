const express = require ('express');
const cors = require ('cors');
const app = express ();
const PORT = process.env.PORT || 3001;

app.use (cors ());

let bodyParser = require ('body-parser');
app.use (bodyParser.json ());

const pgp = require ('pg-promise') ();
const cn = {
  host: 'localhost',
  port: 5432,
  database: 'side_pro',
  user: CONFIG.USER,
  password: CONFIG.PASSWORD,
};
const db = pgp (cn);

var mockData = {
  quizzes: [
    {
      question_body: 'Which color listed below used for Zendesk socks design?',
      answers: [
        {
          title: 'a',
          description: 'purple',
          is_correct: false,
        },
        {
          title: 'b',
          description: 'yellow',
          is_correct: false,
        },
        {
          title: 'c',
          description: 'orange',
          is_correct: true,
        },
      ],
      points: '2',
      id: '1',
    },
    {
      question_body: 'What setence Jeff(from Galahs Team) uses for yarling team member when pairing?',
      answers: [
        {
          title: 'a',
          description: 'Faster',
          is_correct: true,
        },
        {
          title: 'b',
          description: "What's wrong with you?",
          is_correct: false,
        },
        {
          title: 'c',
          description: 'Are you listening?',
          is_correct: false,
        },
      ],
      points: 3,
      id: '2',
    },
  ],
  totalCount: 2,
};

function decodeToken (req) {
  var auth = req.get ('authorization');
  if (!auth) {
    return false;
  }
  var isBearerAuth = auth.split (' ')[0].toLowerCase () === 'bearer';
  if (auth && isBearerAuth) {
    return parsetJwtToken (auth);
  }
}

app.get ('/', (req, res, next) => {
  validateUser (req, res);
});

app.post ('/', (req, res) => {
  db.task (t => {
    return t.oneOrNone ('SELECT google_id FROM USERS').then (user => {
      res.send (user);
      return user;
    });
  });
});

function parsetJwtToken (authToken) {
  var base64Url = authToken.split ('.')[1];
  var base64 = base64Url.replace ('-', '+').replace ('_', '/');
  return JSON.parse (Buffer.from (base64, 'base64').toString ());
}

function validateUser (req, res) {
  const decodedToken = decodeToken (req);

  // Both of aud(audience) and iss(issuer) are correct, so the user is authorized.
  if (!decodedToken.aud || !decodedToken.iss) {
    return res.status (401).send ('Authorization Required 1');
  }
  var clientId = CONFIG.CLIENT_ID;
  var verifiedUrl = 'accounts.google.com' || 'https://accounts.google.com';
  if (decodedToken.aud === clientId && decodedToken.iss === verifiedUrl) {
    res.send (mockData);
  } else {
    return res.status (401).send ('Authorization Required');
  }
}

app.listen (PORT, () => console.log (`Example app listening on port ${PORT}!`));
