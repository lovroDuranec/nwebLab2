import express from 'express';
import path from 'path'
import 'dotenv/config';
import { initializeDatabase, getInformationBasedOnUsernameAndPassword, pool, createUser} from './database.js';
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
const hostname = externalUrl ? '0.0.0.0': '127.0.0.1';


//-----------------------------------------------------------------------------------------------------------------------------------------

app.get('/', async function (req, res) {
  res.render('index', {sqlVul : SQL_VUL});
});


app.get("/place", async (req, res) => {
  if (SQL_VUL){
    const location = req.query.location as string;
    const query = `SELECT * FROM lab2_accounts WHERE place = '${location}'`;
    const result = await pool.query(query);  
  }
  else{
    const location = req.query.location;
    const result = await pool.query('SELECT * FROM lab2_accounts where place = $1', [location]);  
  }
  res.render('index', {data : result.rows});
});

app.post("/sql_change", (req, res) => {
  SQL_VUL = !SQL_VUL;
  res.redirect("/");
});



app.get('/2', async function (req, res) {
  if (currentUser){
    res.render('index2', {username:currentUser.username, information:currentUser.information, location:currentUser.location});  
  }
  else {res.render('index2');}
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const user = await getInformationBasedOnUsernameAndPassword(username, password);
  if (!user) return res.status(401).send("krivi podaci");
  currentUser = user;
  res.redirect("/2");
});

app.get("/makeNew/:username/:password/:place/:information", async (req,res) => {
  const { username, password, place, information } = req.params;
  await createUser(username, password, place, information);
  res.send("added successfully");
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