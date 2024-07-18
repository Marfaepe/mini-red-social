import sqlite3 from 'sqlite3';

// Crear una conexión a una base de datos en la ruta. Siempre tiene que ser global
const db = new sqlite3.Database('baseDatos.db');

function createUser(user) {
    return new Promise((resolve, reject) => {
        // Insertar datos en la tabla de la base de datos que recibimos por el formulario
        const stmt = db.prepare("INSERT INTO users (name, surname, email, username, password) VALUES (?,?,?,?,?)");
        stmt.run([user.name, user.surname, user.email, user.username, user.password],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
    });
};

function createPost(post, imagePath, user_id) {
    return new Promise((resolve, reject) => {
        // Insertar datos en la tabla de la base de datos que recibimos por el formulario post
        const stmt = db.prepare("INSERT INTO post (post_data, post_description, user_id, imagen_url) VALUES (?,?,?,?)");
        stmt.run([post.fecha, post.description, user_id, imagePath],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
    });
};


function getUsername(username) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * from users WHERE username = ?",
            [username],
            function (err, row) {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
    })
}

function getUserById(id) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * from users WHERE user_id = ?",
            [id],
            function (err, row) {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
    })
}

function getAllUsers() {
    return new Promise((resolve, reject) => {
        db.all("SELECT * from users", 
        [],
        (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};



function getAllPostFromUsersFollowedBy(user_id) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT p.post_id, p.post_data, p.post_description, p.user_id, p.imagen_url, u.username
            FROM post p
            INNER JOIN followers f ON p.user_id = f.follower_id
            INNER JOIN users u ON p.user_id = u.user_id
            WHERE f.followed_id = ?;
        `;
        db.all(query, [user_id], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function getFollowed(user_id) {
    return new Promise((resolve, reject) => {
        db.all("SELECT followed_id from followers WHERE follower_id = ?",
            [user_id],
            function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
    })
}

function follow(follower, followed) {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO followers (follower_id, followed_id) VALUES (?,?)",
            [follower, followed],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
    })
}

function unfollow(follower, followed) {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM followers WHERE follower_id = ? AND followed_id = ?",
            [follower, followed],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
    });
}


export { createUser, getFollowed, follow, unfollow, getUsername, getAllUsers, getAllPostFromUsersFollowedBy, getUserById, createPost }
