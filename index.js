const express = require('express')
const cors = require('cors')
const app = express()
const port = 3001

function parsetJwtToken(authToken) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(Buffer.from(base64, 'base64').toString());
    }

    app.use(cors())
    app.get('/', (req, res, next) => {
    var auth = req.get("authorization");
        // On the first request, the "Authorization" header won't exist, so we'll set a Response
        // header that prompts the browser to ask for a username and password.
    if (auth  && auth.split(' ')[0].toLowerCase() === 'bearer') {
    const decodedToken = parsetJwtToken(auth);
        // console.log('decoded', decodedToken)
        // The username and password are correct, so the user is authorized.

      return res.send( 
      {
        "quizzes": [
            {
              "question_body": "Which color listed below used for Zendesk socks design?",
              "answers": [
                {
                  "title" : "a",
                  "description": "purple",
                  "is_correct": false
                },
                {
                  "title" : "b",
                  "description": "yellow",
                  "is_correct": false
                },
                {
                  "title" : "c",
                  "description": "orange",
                  "is_correct": true
                }
              ],
              "points": "2",
              "id": "1"
            },
            {
              "question_body": "What setence Jeff(from Galahs Team) uses for yarling team member when pairing?",
              "answers": [
                {
                  "title" : "a",
                  "description": "Faster",
                  "is_correct": true
                },
                {
                  "title" : "b",
                  "description": "What's wrong with you?",
                  "is_correct": false
                },
                {
                  "title" : "c",
                  "description": "Are you listening?",
                  "is_correct": false
                }
              ],
              "points": 3,
              "id": "2"
            }
          ],
          "totalCount": 2
        });
    } else {
        res.set("WWW-Authenticate", "Basic realm=\"Authorization Required\"");
        // If the user cancels the dialog, or enters the password wrong too many times,
        // show the Access Restricted error message.
        return res.status(401).send("Authorization Required");
    }
  })

app.listen(port, () => console.log(`Example app listening on port ${port}!`))