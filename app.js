const express = require ('express');
const cors = require ('cors');
const app = express ();
const PORT = process.env.PORT || 3001;
require ('dotenv').config ();

app.use (cors ());

let bodyParser = require ('body-parser');
app.use (bodyParser.json ());

const pgp = require ('pg-promise') ();
const cn = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};
const db = pgp (cn); // database instance;

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

const mapToUserJson = rawJson => {
  console.log ('rawJson in mapto user json', rawJson);
  let user = {
    id: rawJson.id,
    google_id: rawJson.google_id,
    email: rawJson.email,
    given_name: rawJson.given_name,
    family_name: rawJson.family_name,
    default_avatar_url: rawJson.default_avatar_url,
    avaBorder: rawJson.avatar_border,
    avaBGround: rawJson.avatar_background_colour,
    avaSymobol: rawJson.avatar_symbol,
    scores: rawJson.scores,
    question_id: rawJson.question_id,
    created_at: rawJson.created_at,
  };
  console.log ('strignified user', JSON.stringify (user));
  return user;
};

const createNewQuizAnswer = ele => {
  return {
    id: ele.answer_id,
    title: ele.content_order,
    content: ele.content,
  };
};

const mapToQuizJson = rawJson => {
  let quizzes = [];

  rawJson.forEach (element => {
    if (quizzes.length === 0) {
      let quiz = {
        id: element.id,
        question_body: element.question_body,
        order_num: element.order_num,
        type: element.type,
        answers: [],
      };
      let newQuizAnswer = createNewQuizAnswer (element);
      quiz.answers.push (newQuizAnswer);
      quizzes.push (quiz);
    } else {
      let foundQuiz = false;

      for (var i = 0; i < quizzes.length; i++) {
        if (quizzes[i].id == element.id) {
          foundQuiz = true;
          let newQuizAnswer = createNewQuizAnswer (element);
          quizzes[i].answers.push (newQuizAnswer);
        }
      }
      if (!foundQuiz) {
        let quiz = {
          id: element.id,
          question_body: element.question_body,
          points: element.points,
          order_num: element.order_num,
          type: element.type,
          answers: [],
        };
        let newQuizAnswer = createNewQuizAnswer (element);
        quiz.answers.push (newQuizAnswer);
        quizzes.push (quiz);
      }
    }
  });
  console.log ('stringified quizzes-', JSON.stringify (quizzes));
  return quizzes;
};

app.get ('/', (req, res, next) => {
  const decodedToken = decodeToken (req);
  console.log ('decodedToken.sub', decodedToken.sub);
  const isValidated = doValidate (decodedToken, res);
  console.log ('isValidated', isValidated);
  if (isValidated) {
    db.task (t => {
      return t
        .oneOrNone ('SELECT * FROM USERS where google_id = ${google_id}', {
          google_id: decodedToken.sub,
        })
        .then (user => {
          if (!user) {
            // No found in db, ready to save into db
            return t.oneOrNone (
              'INSERT INTO users (google_id,email,given_name,family_name,default_avatar_url) VALUES (${google_id},${email},${given_name},${family_name},${default_avatar_url}) RETURNING id;',
              {
                google_id: decodedToken.sub,
                email: decodedToken.email,
                given_name: decodedToken.given_name,
                family_name: decodedToken.family_name,
                default_avatar_url: decodedToken.picture,
              }
            );
          }
          var userInfo = mapToUserJson (user);
          res.send (userInfo);
        })
        .catch (error => {
          console.log ('error', error);
        })
        .finally ();
    });
  }
});

app.get ('/quiz/result', (req, res, next) => {
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
              return t.oneOrNone (
                'INSERT INTO users (google_id,email,given_name,family_name,default_avatar_url) VALUES (${google_id},${email},${given_name},${family_name},${default_avatar_url}) RETURNING id;',
                {
                  google_id: decodedToken.sub,
                  email: decodedToken.email,
                  given_name: decodedToken.given_name,
                  family_name: decodedToken.family_name,
                  default_avatar_url: decodedToken.picture,
                }
              );
            }
            return user;
          });
      })
      .then (user => {
        return db.task (t => {
          return t.any (
            "SELECT q.id as question_id, a.id as answer_id, a.is_correct,case when a.is_correct=true then scores else 0 end as scores FROM questions q left join answers a on a.question_id = q.id where q.type='onboarding' and a.created_by=${created_by};",
            {
              // type: req.type,
              created_by: user.id,
            }
          );
        });
      })
      .then (result => {
        res.send (result);
      })
      .catch (error => {
        console.log ('error', error);
      })
      .finally ();
  }
});

app.get ('/quiz', (req, res, next) => {
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
              return t.oneOrNone (
                'INSERT INTO users (google_id,email,given_name,family_name,default_avatar_url) VALUES (${google_id},${email},${given_name},${family_name},${default_avatar_url}) RETURNING id;',
                {
                  google_id: decodedToken.sub,
                  email: decodedToken.email,
                  given_name: decodedToken.given_name,
                  family_name: decodedToken.family_name,
                  default_avatar_url: decodedToken.picture,
                }
              );
            }
            return user;
          });
      })
      .then (user => {
        return db.task (t => {
          return t.any (
            'SELECT q.id, q.question_body, q.order_num, q.type, a.id as answer_id, a.content_order, a.content, a.is_correct, u.given_name, u.family_name, u.default_avatar_url, s.scores FROM QUESTIONS Q LEFT JOIN ANSWERS A on Q.id = A.question_id LEFT JOIN SCORES S on Q.id = S.id LEFT JOIN USERS U on U.id = Q.created_by order by a.content_order asc'
          );
        });
      })
      .then (result => {
        var quizzes = mapToQuizJson (result);
        res.send (quizzes);
      })
      .catch (error => {
        console.log ('error', error);
      })
      .finally ();
  }
});

app.post ('/quiz', (req, res) => {
  const decodedToken = decodeToken (req);
  const isValidated = doValidate (decodedToken, res);

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
              return 'Error';
            }
            return user.id;
          });
      })
      .then (userId => {
        if (userId) {
          return db.task (t => {
            return t
              .oneOrNone (
                'SELECT count(1) FROM answers where question_id=${question_id} AND created_by=${created_by}',
                {
                  question_id: req.body.questionId,
                  created_by: userId,
                }
              )
              .then (result => {
                if (result === 0) {
                  return userId;
                } else {
                  res
                    .status (400)
                    .send ({error: 'The answer was already submitted!'});
                  return null;
                }
              });
          });
        }
      })
      .then (userId => {
        if (userId) {
          return db.task (t => {
            return t
              .oneOrNone (
                'SELECT id FROM answers where question_id=${question_id} AND is_correct=true',
                {
                  question_id: req.body.questionId,
                }
              )
              .then (answer => {
                if (answer.id === req.body.selectAnswerId) {
                  return {userId: userId, isCorrect: true};
                } else {
                  return {userId: userId, isCorrect: false};
                }
              });
          });
        } else {
          return null;
        }
      })
      .then (result => {
        console.log ('result for isCorrect', result);
        if (!result) {
          return null;
        }
        if (result.isCorrect) {
          db.task (t => {
            return t.oneOrNone (
              'INSERT INTO scores(user_id, question_id, selected_answer_id, scores, created_at)  SELECT ${user_id},question_id,${selected_answer_id}, q.scores, now() FROM answers a left join questions q on a.question_id = q.id where a.id = ${selected_answer_id} RETURNING id;',
              {
                user_id: result.userId,
                selected_answer_id: req.body.selectAnswerId,
              }
            );
          });
        } else {
          db.task (t => {
            return t.oneOrNone (
              'INSERT INTO scores(user_id, question_id, selected_answer_id, scores, created_at)  SELECT ${user_id},question_id,${selected_answer_id}, 0, now() FROM answers a left join questions q on a.question_id = q.id where a.id = ${selected_answer_id} RETURNING id;',
              {
                user_id: result.userId,
                selected_answer_id: req.body.selectAnswerId,
              }
            );
          });
        }
        const isCorrect = {isCorrect: result.isCorrect};
        res.send (isCorrect);
      })
      .catch (error => {
        console.log ('error', error);
      })
      .finally ();
  }
});

app.post ('/user', (req, res) => {
  const decodedToken = decodeToken (req);
  const isValidated = doValidate (decodedToken, res);

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
              return 'Error';
            }
            console.log ('user in new post!!!!', user);
            return user;
          });
      })
      .then (user => {
        db.task (t => {
          return t.oneOrNone (
            'UPDATE users SET avatar_border=${avatar_border}, avatar_background_colour=${avatar_background_colour}, avatar_symbol=${avatar_symbol}, created_at=now() WHERE id=${user_id} RETURNING id;',
            {
              user_id: user.id,
              avatar_border: req.body.avatar_border,
              avatar_background_colour: req.body.avatar_background_colour,
              avatar_symbol: req.body.avatar_symbol,
            }
          );
        });
        const updatedAvatar = {
          isUpdated: true,
          avatar_border: req.body.avatar_border,
          avatar_background_colour: req.body.avatar_background_colour,
          avatar_symbol: req.body.avatar_symbol,
        };
        res.send (updatedAvatar);
      })
      .catch (error => {
        console.log ('error', error);
      })
      .finally ();
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

  const clientId = process.env.GOOGLE_CLIENT_ID;
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
