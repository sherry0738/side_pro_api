CREATE TABLE users (
	id SERIAL PRIMARY KEY,
    google_id VARCHAR(100) NOT NULL,
	email VARCHAR(300) NOT NULL,
	given_name VARCHAR(400) NOT NULL,
    family_name VARCHAR(400) NOT NULL,
    default_avatar_url VARCHAR(800),
    avatar_border VARCHAR(600),
    avatar_background_colour VARCHAR(600),
    avatar_symbol VARCHAR(600),
	created_at TIMESTAMP   
);

CREATE TABLE questions (
	id SERIAL PRIMARY KEY,
	question_body VARCHAR(900),
	created_by INTEGER,
	created_at TIMESTAMP,
	FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT
);

CREATE TABLE answers (
	id SERIAL PRIMARY KEY,
	question_id INTEGER NOT NULL,
	content VARCHAR(900) NOT NULL,
	is_correct BOOLEAN NOT NULL,
	created_by INTEGER,
	created_at TIMESTAMP,
	FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT,
	FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE RESTRICT
);

CREATE TABLE scores (
	id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
	question_id INTEGER NOT NULL,
	selected_answer_id INTEGER NOT NULL,
	scores INTEGER NOT NULL,
	created_at TIMESTAMP,
	FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
	FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE RESTRICT,
    FOREIGN KEY (selected_answer_id) REFERENCES answers(id) ON DELETE RESTRICT
);

ALTER TABLE users ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE answers ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE questions ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE scores ALTER COLUMN created_at SET DEFAULT now();