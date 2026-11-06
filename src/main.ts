import express from 'express';
import path from 'path'
import oidc from 'express-openid-connect';
import QRCode from 'qrcode';
const { auth, requiresAuth } = oidc;
import 'dotenv/config';
import { initializeDatabase, getInformationBasedOnUsernameAndPassword, createUser } from './database.js';
await initializeDatabase();



const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;
const baseURL = externalUrl || `http://localhost:${port}`

const app = express();
app.set("views", path.join(import.meta.dirname, "views"));
app.set('view engine', 'pug');
app.use(express.json());
console.log("views path: ", path.join(import.meta.dirname, "views"));

const hostname = externalUrl ? '0.0.0.0': '127.0.0.1'; // must match the callback URL registered in Auth0


//-----------------------------------------------------------------------------------------------------------------------------------------

app.get('/', async function (req, res) {
  let username : string | undefined;

  res.render('index', {username});
  console.log("/ radi");
});

app.get('/2', async function (req, res) {
  let username : string | undefined;

  res.render('index2', {username});
  console.log("/2 radi");
});


app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

});


app.listen(port, hostname, () => {
  console.log(`Server locally running at http://${hostname}:${port}`)
  if (externalUrl)
    console.log(`External URL: ${externalUrl}`);
});