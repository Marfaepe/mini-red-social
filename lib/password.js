import bcrypt from "bcryptjs";

function genSalt(rounds){
    return new Promise((resolve, reject)=>{
        bcrypt.genSalt(rounds, (err, salt)=>{
            if(err){
                reject(err);
            } else {
                resolve(salt);
            }
        });
    });
}



function hash(password, salt) {
    // La función 'hash' toma dos argumentos: 'password' (la contraseña a hashear) y 'salt' (el valor del salt).

    return new Promise((resolve, reject) => {
        // Esta función devuelve una Promesa. Una Promesa es un objeto que representa la eventual finalización (o falla) de una operación asincrónica y su valor resultante.

        bcrypt.hash(password, salt, (err, hash) => {
            // Se llama a 'bcrypt.hash' para generar un hash de la contraseña usando el salt proporcionado.
            // 'bcrypt.hash' es una función asincrónica que toma la contraseña, el salt y una función de callback como argumentos.

            if (err) {
                // Si ocurre un error durante el proceso de hashing...

                reject(err);
                // ...la Promesa se rechaza con el error.
            } else {
                // Si no hay errores...

                resolve(hash);
                // ...la Promesa se resuelve con el hash generado.
            }
        });
    });
}


function compare(password, hash) {
    // Esta función 'compare' toma dos argumentos: 'password' (la contraseña sin hash) y 'hash' (la contraseña hasheada).

    // Devuelve el resultado de la comparación entre la contraseña sin hash y la hasheada utilizando bcrypt.
    // 'bcrypt.compare' es una función asincrónica que compara una contraseña sin hash con una hasheada.
    // Esta función devuelve una promesa que se resuelve con 'true' si las contraseñas coinciden y 'false' en caso contrario.
    return bcrypt.compare(password, hash);
}

export {genSalt, hash, compare };
