const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

function generateRandomString() {
  let random = "";
  let characters = 'abcdefghijklmnopqrstuvwxyz1234567890'
  for (let i = 0; i < 6; i++){
    random += characters.charAt(Math.random() * characters.length);
  }
  return random;
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok");// Respond with 'Ok' (we will replace this)
  let randomString = generateRandomString()
  const templateVars = { shortURL: randomString, longURL: req.body.longURL}   // don't need params because it is coming from the body not the browser      
  console.log(templateVars.shortURL)
  urlDatabase[templateVars.shortURL] = templateVars.longURL;
  console.log(urlDatabase)
  res.redirect(`/urls/${templateVars.shortURL}`)
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls : urlDatabase }//this makes an object called urls with a single object with the data from the urlDatabase.
  
  res.render("urls_index", templateVars)
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars= { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL] 
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
