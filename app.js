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
const db = pgp (cn); // database instance;

let mockData = {
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

decodeToken = req => {
  let auth = req.get ('authorization');
  if (!auth) {
    console.log ('Log in failed');
    return false;
  }
  let isBearerAuth = auth.split (' ')[0].toLowerCase () === 'bearer';
  if (auth && isBearerAuth) {
    return parsetJwtToken (auth);
  }
};

app.get ('/', (req, res, next) => {
  const decodedToken = decodeToken (req);
  console.log ('decodedToken.sub', decodedToken.sub);
  const isValidated = doValidate (decodedToken, res);
  console.log ('isValidated', isValidated);
  if (isValidated) {
    db
      .task (t => {
        return t
          .oneOrNone ('SELECT * FROM USERS where google_id = ${google_id}', {
            google_id: decodedToken.sub,
          })
          .then (user => {
            if (!user) {
              // No found in db, ready to save into db
              return t
                .oneOrNone (
                  'INSERT INTO users (google_id,email,given_name,family_name,default_avatar_url) VALUES (${google_id},${email},${given_name},${family_name},${default_avatar_url}) RETURNING id;',
                  {
                    google_id: decodedToken.sub,
                    email: decodedToken.email,
                    given_name: decodedToken.given_name,
                    family_name: decodedToken.family_name,
                    default_avatar_url: decodedToken.picture,
                  }
                )
                .then (result => {
                  console.log ('result', result);
                });
            }
            return mockData;
            // return res.send (mockData);
          });
      })
      .then (events => {
        console.log (events);
      })
      .catch (error => {
        console.log (error);
      })
      .finally (res.sendStatus (200));
  }
});

function parsetJwtToken (authToken) {
  let base64Url = authToken.split ('.')[1];
  let base64 = base64Url.replace ('-', '+').replace ('_', '/');
  return JSON.parse (Buffer.from (base64, 'base64').toString ());
}

function doValidate (decodedToken, res) {
  if (!decodedToken.aud || !decodedToken.iss) {
    return res
      .status (401)
      .send (
        'The user need log in with a Google account. Authorization Required 1'
      );
  }
  let clientId = CONFIG.CLIENT_ID;
  let verifiedUrl = 'accounts.google.com' || 'https://accounts.google.com';
  const validatedUser =
    decodedToken.aud === clientId &&
    decodedToken.iss === verifiedUrl &&
    decodedToken.email_verified === true;

  if (!validatedUser) {
    return res
      .status (401)
      .send (
        'The user need log in with a Google account. Authorization Required 2'
      );
  }
  console.log ('validation done!');
  return true;
}

app.listen (PORT, () => console.log (`Example app listening on port ${PORT}!`));
