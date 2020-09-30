const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { response } = require("express");


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

//random string generator for id
const generateRandomString = function(){
  let random = "";
  const characters = 'abcdefghijklmnopqrstuvwxyz1234567890'
  for (let i = 0; i < 6; i++){
    random += characters.charAt(Math.random() * characters.length);
  }
  return random;
}
//check if email is already registered
const checkRegisteredEmail = function (usersDb, userEmail){
  for (let key in usersDb){
    if(usersDb[key].email === userEmail ){
      return true;
    }
  }
  return false;
}
//seed data for user database
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
//seed data for URL database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//landing page
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//login
app.post("/login", (req,res) => {
  // const logInName = req.body.username
  // console.log(logInName)
  // res.cookie("username", logInName )
  res.redirect("/login")
});

//logout
app.post("/logout",(req,res) => {
console.log(req.body.userEmail)
res.clearCookie("user_id");
res.redirect("/urls");
})

//sign up route
app.get("/register",(req,res) => {
res.render("urls_register");
})

//registering user
app.post("/register",(req,res) => {
let userEmail = req.body.email;
let userPassword = req.body.password;
  if(!userEmail || !userPassword){
     res.status(400).send("Invalid email or password");
  } else if(checkRegisteredEmail(users, userEmail)){
    res.status(400).send("Email already taken");
  } else {

  let userId = generateRandomString();
  users[userId] = {id: userId, email: userEmail, password: userPassword};
  res.cookie("user_id", userId );
  res.redirect('/urls');
  console.log(users)
  }
})

//creating a new url
app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok");// Respond with 'Ok' (we will replace this)
  let randomString = generateRandomString() // to generate a random id
  const fullURL = req.body.longURL
  const templateVars = { shortURL: randomString, longURL: fullURL}   // don't need params because it is coming from the body not the browser      
  
  urlDatabase[templateVars.shortURL] = templateVars.longURL;
 
  res.redirect(`/urls/${templateVars.shortURL}`)
});

//goes to the form for creating a new URL
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] }
  res.render("urls_new", templateVars);
});
// username: req.cookies["username"] before we used the users object

//browse the url database
app.get("/urls", (req, res) => {
  const templateVars = { urls : urlDatabase, user: users[req.cookies["user_id"]]  }//this makes an object called urls with a single object with the data from the urlDatabase.
  // console.log(templateVars);
  res.render("urls_index", templateVars)
});
// username: req.cookies["username"] before we used the users object

//read a specific url
app.get("/urls/:shortURL", (req, res) => {
  const tinyURL = req.params.shortURL;
  const templateVars= { shortURL: tinyURL, longURL: urlDatabase[tinyURL], user: users[req.cookies["user_id"]]  }
  res.render("urls_show", templateVars);
});
// username: req.cookies["username"] before we used the users object

//redirect to the actual website from the shortened URL
app.get("/u/:shortURL", (req, res) => {
  const tinyURL = req.params.shortURL;
  const longURL = urlDatabase[tinyURL];
  res.redirect(longURL);
});
//edit the longURL 
app.post("/urls/:shortURL", (req, res) =>{
  const tinyURL = req.params.shortURL;
  const newName = req.body.longURL;
  urlDatabase[tinyURL] = newName;
  // console.log(req.params.shortURL)
  // console.log(req.body.longURL)
  res.redirect("/urls");
});
//delete an URL
app.post("/urls/:url/delete", (req, res) => {
  
  delete urlDatabase[req.params.url]
  // console.log(urlDatabase)
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
