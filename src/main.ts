import express from 'express';
import path from 'path'
import 'dotenv/config';
import { initializeDatabase, getInformationBasedOnUsernameAndPassword, pool, createUser, checkForUsername} from './database.js';
await initializeDatabase();



const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;
const baseURL = externalUrl || `http://localhost:${port}`

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(import.meta.dirname, "views"));
app.set('view engine', 'pug');
app.use(express.json());
console.log("views path: ", path.join(import.meta.dirname, "views"));

let currentUser: {username: string; information: string; location:string} | undefined;
let SQL_VUL = true;
let BA_VUL = true;
const hostname = externalUrl ? '0.0.0.0': '127.0.0.1';


//-----------------------------------------------------------------------------------------------------------------------------------------

app.get('/', async function (req, res) {
  res.render('index', {sqlVul : SQL_VUL});
});


app.get("/place", async (req, res) => {
  let result;
  if (SQL_VUL){
    const location = req.query.location as string;
    const query = `SELECT * FROM lab2_accounts WHERE place = '${location}'`;
    result = await pool.query(query);  
  }
  else{
    const location = req.query.location;
    result = await pool.query('SELECT * FROM lab2_accounts where place = $1', [location]);  
  }
  res.render('index', {data : result.rows, sqlVul : SQL_VUL});
});

app.post("/sql_change", (req, res) => {
  SQL_VUL = !SQL_VUL;
  res.redirect("/");
});



app.get('/2', async function (req, res) {
  if (currentUser){
    res.render('index2', {username:currentUser.username, information:currentUser.information, location:currentUser.location});  
  }
  else {res.render('index2', {baVul : BA_VUL});}
});

app.post("/broken_auth_change", (req, res) => {
  BA_VUL = !BA_VUL;
  res.redirect("/2");
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const user = await getInformationBasedOnUsernameAndPassword(username, password);
  if (BA_VUL){
    if (!user){
      const hasUsername = await checkForUsername(username);
      if (!hasUsername){
        return res.render("index2", {baVul : BA_VUL, custom_error : "Ne postoji korisnicko ime"});
      }
      return res.render("index2", {baVul : BA_VUL, custom_error : "Lozinka nije dobra"});
    }
    currentUser = {username: user.username, information: user.information, location: user.place};
    res.redirect("/2");
  }
  else{
    if (!user){
      return res.render("index2", {baVul : BA_VUL, custom_error : "Prijava nije uspijela"})
    }
    currentUser = {username: user.username, information: user.information, location: user.place};
    res.redirect("/2");
  }
  
});

app.post("/logout", (req, res) =>{
  currentUser = undefined;
  res.redirect("/2");
})

app.listen(port, hostname, () => {
  console.log(`Server locally running at http://${hostname}:${port}`)
  if (externalUrl)
    console.log(`External URL: ${externalUrl}`);
});