import express from 'express';
import nunjucks from 'nunjucks';
import bcryptjs from 'bcryptjs';
import session from 'express-session';
import * as Passwords from "./lib/password.js";
import * as Db from "./lib/db.js";
import csurf from "csurf";
import multer from 'multer';


const app = express();
const port = 3000;


// Multipart formdata
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1000 * 1000 }  // Limitar tamaño de archivos
});



//Sistema de plantillas
nunjucks.configure('templates', {
  autoescape: true,
  express: app,
  watch: true
});


//middlewares
app.use('/static', express.static('public'));

app.use(express.urlencoded({ extended: true }));//Leer el contenido del formulario

//Aquí va el código de cookies
/*  app.use(session({
  secret: 'This should be a prepares secret',    //se genera desde aleatorio es mejor desde el nucleo
  cookie: { maxAge: 60000 }
}));  */

// Configuración de sesiones
app.use(session({
  secret: 'This should be a prepared secret',    // Genera esta clave aleatoriamente
  resave: false,  // O true, dependiendo de tus necesidades
  saveUninitialized: false,  // O true, dependiendo de tus necesidades
  cookie: { maxAge: 60000 }
}));


// Para proteger contra ataques CSRF 
const csurfMidleware = (csurf("This also should be a secret", ["POST"]));

//función para verificar si el usuario está  logeado
function protectedByLogin(req, res, next) {
  if (req.session.user_id !== undefined) {
    next();
  } else {
    res.render('/login');
  }
}



// Static file server for the uploads
app.use('/uploads', express.static('uploads'));

// Middleware para procesar la carga de archivos
app.post('/submit_entrada', protectedByLogin, upload.single('avatar'), csurfMidleware, async (req, res) => {
  try {
    // Procesamiento de la carga de archivos
    res.send('Archivo subido exitosamente');
    //crear un post
    await Db.createPost(req.body, req.file.path, req.session.user_id);
    res.redirect('/home');

  } catch (error) {
    console.log(error);
    const csrfToken = req.csrfToken();
    res.status(400).render('home.html', { mesage: 'Error al crear el post', csrfToken })

  }
});

app.use(csurfMidleware);

//Rutas

// Ruta para la página de inicio

app.get('/', protectedByLogin, (req, res) => {
  res.redirect('/home');
})

app.get('/home', protectedByLogin, async (req, res) => {
  try {
    let user = await Db.getUserById(req.session.user_id);
    let posts = await Db.getAllPostFromUsersFollowedBy(req.session.user_id); // Obtener publicaciones reales desde la base de datos
    let csrfToken = req.csrfToken();
    res.render('home.html', { posts: posts, csrfToken });
  } catch (error) {
    console.error('Error al obtener publicaciones', error);
    res.render('home.html', { posts: [], message: 'Error al obtener publicaciones' });
  }
});

//Ruta para la página de los usuarios
app.get('/users', protectedByLogin, async (req, res) => {
  try {
    //Obtener la lista de usuarios desde la base de Datos
    let users = await Db.getAllUsers(); //Funcion sacada desde  DB
    let followed = await Db.getFollowed(req.session.user_id);
    let isFollowed = (user, follows) => {

      return follows.find((el) => el.followed_id == user.user_id);
    }
    res.render('users.html', { users: users, followed: followed, isFollowed: isFollowed });
  }
  catch (error) {
    console.error('Error al obtener la lista de ususario', error);
    res.render('users.html', { users: [], message: 'Error al obtener la lista de usuarios' });
  }
});

//Ruta para los follow

app.get("/follow/:followed_id", protectedByLogin, async (req, res) => {
  await Db.follow(req.session.user_id, req.params.followed_id);
  res.redirect("/users");
});

app.get("/unfollow/:followed_id", protectedByLogin, async (req, res) => {
  await Db.unfollow(req.session.user_id, req.params.followed_id);
  res.redirect("/users");
})

app.get("/logout", (req, res) => {
  req.session.user_id = undefined;
  res.redirect("/login");
});


//Ruta del login
app.get('/login', (req, res) => {
  const csrfToken = req.csrfToken();
  res.render('login.html', { csrfToken });
});


app.post('/login', async (req, res) => {
  const csrfToken = req.csrfToken();
  try {
    let user = await Db.getUsername(req.body.username);
    if (user && await Passwords.compare(req.body.password, user.password)) {
      // conectado correctamente
      console.log(user);
      req.session.user_id = user.user_id;

      res.redirect('/home');
      console.log('hiolaaaaaaaaaaaa');

    } else {
      res.status(400).render('login.html', { message: 'Usuario o contraseña incorrectas', csrfToken });
    }
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).render('login.html', { message: 'Error en el servidor, por favor intenta nuevamente', csrfToken });
  }
});


//Ruta para registrarse

app.get('/register', (req, res) => {
  const csrfToken = req.csrfToken();
  res.render('register.html', { csrfToken });
});


// Ruta para procesar el formulario de registro
app.post("/register", async (req, res) => {
  // Verifica si las contraseñas ingresadas coinciden
  if (req.body.password !== req.body.repeatPassword) {
    // Si no coinciden, renderiza la página de registro nuevamente con un mensaje de error
    res.status(400).render("register.html", { message: "Las contraseñas no coinciden", csrfToken });
    return;
  }
  try {
    // Hash de la contraseña antes de guardarla
    let salt = await Passwords.genSalt(10);
    let hashedPassword = await Passwords.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    // Intenta crear un usuario con la información proporcionada
    await Db.createUser(req.body);
    console.log('aquí el usuario se ha creado');
    // TODO: Registro completado correctamente, ¿qué debo hacer ahora??
    // Renderiza la página de inicio después de registrar correctamente+
    res.render("login.html");


  } catch (error) {
    const csrfToken = req.csrfToken();
    // Manejo de errores: imprime el error en la consola
    res.status(400).render('register.html', { message: 'Error al registrar el usuario', csrfToken });
  }
});



app.listen(port, () => {
  console.log(`Ejemplo de app listen en el puerto ${port}`);
});


//Cerrar ña base de datos
process.on('SIGINT', () => {
  Db.close();
  process.exit();
});

process.on('SIGTERM', () => {
  Db.close();
  process.exit();
});