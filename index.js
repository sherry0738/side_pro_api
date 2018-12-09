const express = require('express')
const cors = require('cors')
const app = express()
const port = 3001

app.use(cors())
app.get('/', (req, res) => res.send(
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
        }
    
    
      
       ))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))