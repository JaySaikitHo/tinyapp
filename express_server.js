const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
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
    if(usersDB[key].email === logInName &&  bcrypt.compareSync(loginPassWord,usersDB[key].password)){
       return usersDB[key];
    }
  }
  return null;
}

//check ids of users and urls to return an object with only urls the user created
const urlsForUser = function(id){
     
  let privateDatabase = {};
    for(let key in urlDatabase){
       if(urlDatabase[key].UserID === id){
        
        privateDatabase[key] = urlDatabase[key];
      }   
    } 
  return privateDatabase;  
}
 
//seed data for user database
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("abc",10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("123",10)
  }
}
//seed data for URL database
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", UserID: "userRandomID"}, 
  "9sm5xK": {longURL: "http://www.google.com", UserID: "user2RandomID"}
};
//landing page
app.get("/", (req, res) => {
  res.send("Hello!");
});

//render log in page
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
  console.log(user)
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

const userEmail = req.body.email;
const UserPassword = req.body.password;
const hashedPassword = bcrypt.hashSync(UserPassword,10);  
  if(!userEmail || !UserPassword){
     res.status(400).send("Invalid email or password");
  } else if(checkEmail(users, userEmail)){
    res.status(400).send("Email already taken");
        
  } else {
    const userId = generateRandomString();
    users[userId] = {id: userId, email: userEmail, password: hashedPassword};
    
    res.cookie("user_id", userId)
    res.redirect("/urls");
  }
})

//creating a new url
app.post("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  console.log(user)
  if(user){
    let randomString = generateRandomString() // to generate a random id
    const fullURL = req.body.longURL
    const templateVars = { shortURL: randomString, longURL: fullURL }   // don't need params because it is coming from the body not the browser      
    urlDatabase[templateVars.shortURL] = {longURL: templateVars.longURL, UserID: user["id"]}

    console.log(urlDatabase)
    res.redirect(`/urls/${templateVars.shortURL}`)
  
  } else {
    res.status(403).send("you don't have permission to do that")
  }

});

//goes to the form for creating a new URL
app.get("/urls/new", (req, res) => {
  
  const user = users[req.cookies["user_id"]];

  if(user){
    const templateVars = { user: user["email"] } ;
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  }
});


//browse the url database
app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]]; //set user to get the id only instead of whole users object.
    
  if(user){
    let privateDatabase = urlsForUser(user.id)
    const templateVars = { urls : privateDatabase, user: user["email"]  }//this makes an object called urls with a single object with the data from the urlDatabase.
    // console.log(templateVars);
    res.render("urls_index", templateVars)
  } else {
    res.status(403)
    res.redirect("/login")
  }
});


//read a specific url
app.get("/urls/:shortURL", (req, res) => {
  const tinyURL = req.params.shortURL;
  const user = users[req.cookies["user_id"]];
  const templateVars= { shortURL: tinyURL, longURL: urlDatabase[tinyURL].longURL, user: user["email"] }
  res.render("urls_show", templateVars);
});


//redirect to the actual website from the shortened URL
app.get("/u/:shortURL", (req, res) => {
  const tinyURL = req.params.shortURL;
  const realURL = urlDatabase[tinyURL].longURL;
  res.redirect(realURL);
});

//edit the longURL 
app.post("/urls/:shortURL", (req, res) =>{
  const user = users[req.cookies["user_id"]]
 if(user){
  const tinyURL = req.params.shortURL;
  const newName = req.body.longURL;
  urlDatabase[tinyURL] = newName;
  res.redirect("/urls");
 } else {
   res.send("You don't have permission to do that")
 }
});
//delete an URL
app.post("/urls/:url/delete", (req, res) => {
  const user = users[req.cookies["user_id"]]
  if(user){
  delete urlDatabase[req.params.url]
  
  res.redirect("/urls")
  } else {
    res.send("You don't have permissiont to do that")
  }
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
