CREATE TABLE users (
    user_id INTEGER NOT NULL UNIQUE ,
    name varchar(255) NOT NULL,
    surname varchar(255),
    email TEXT UNIQUE NOT NULL,
    username varchar(10) NOT NULL UNIQUE,
    password varchar(20) NOT NULL,
    PRIMARY KEY (user_id)
); 


CREATE TABLE post (
    post_id INTEGER PRIMARY KEY,
    post_data TEXT NOT NULL,
    post_description varchar(200) NOT NULL,
    imagen_url TEXT,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
); 


CREATE TABLE followers (
   follower_id INTEGER,
   followed_id INTEGER,
   PRIMARY KEY(follower_id, followed_id),
   FOREIGN KEY(follower_id) REFERENCES users(user_id),
   FOREIGN KEY(followed_id) REFERENCES users(user_id)
); 



