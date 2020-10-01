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
const checkEmail = function (usersDb, inputEmail){
  for (let key in usersDb){
      if(usersDb[key].email === inputEmail){
      return true;
    }
  }
  return false;
}

//check if password and email match at login
const getLoginUser = function (usersDB,logInName,loginPassWord){
  for(let key in usersDB){
    if(usersDB[key].password === loginPassWord && checkEmail(usersDB,logInName)){
      return usersDB[key];
    }
  }
  return null;
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


app.get("/login", (req, res) =>{
  const user = users[req.cookies["user_id"]];
  const templateVars = { user: user }
    res.render("urls_login",templateVars)
})

//login
app.post("/login", (req,res) => {
  const logInName = req.body.username
  const loginPassWord = req.body.password
  const user = getLoginUser(users,logInName,loginPassWord)
  // console.log(user)
  if(user){
        
    res.cookie("user_id", user.id)
    res.redirect("/urls");
  } else {
    res.status(403).send("User and or password do not match")
    
  }  
});

//logout
app.post("/logout",(req,res) => {

res.clearCookie("user_id");
res.redirect("/urls");
})

//register route
app.get("/register",(req,res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user: user }
  res.render("urls_register", templateVars);
})

//registering user
app.post("/register",(req,res) => {

let userEmail = req.body.email;
let userPassword = req.body.password;
  if(!userEmail || !userPassword){
     res.status(400).send("Invalid email or password");
  } else if(checkEmail(users, userEmail)){
    res.status(400).send("Email already taken");
        
  } else {
    const userId = generateRandomString();
    users[userId] = {id: userId, email: userEmail, password: userPassword};
    res.cookie("user_id", userId)
  
  
  res.redirect("/urls");
  }
})

//creating a new url
app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
 
  let randomString = generateRandomString() // to generate a random id
  const fullURL = req.body.longURL
  const templateVars = { shortURL: randomString, longURL: fullURL}   // don't need params because it is coming from the body not the browser      
  
  urlDatabase[templateVars.shortURL] = templateVars.longURL;
 
  res.redirect(`/urls/${templateVars.shortURL}`)
});

//goes to the form for creating a new URL
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user: user["email"] } ;
  res.render("urls_new", templateVars);
});


//browse the url database
app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  //set user to get the id only instead of whole users object.
  if(user){
  const templateVars = { urls : urlDatabase, user: user["email"]  }//this makes an object called urls with a single object with the data from the urlDatabase.
  // console.log(templateVars);
  res.render("urls_index", templateVars)
} else {
  res.status(403).send("You are not logged in")
}
});


//read a specific url
app.get("/urls/:shortURL", (req, res) => {
  const tinyURL = req.params.shortURL;
  const user = users[req.cookies["user_id"]];
  const templateVars= { shortURL: tinyURL, longURL: urlDatabase[tinyURL], user: user["email"]  }
  res.render("urls_show", templateVars);
});


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
  
  res.redirect("/urls");
});
//delete an URL
app.post("/urls/:url/delete", (req, res) => {
  
  delete urlDatabase[req.params.url]
  
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
