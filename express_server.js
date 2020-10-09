const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { response } = require("express");
const { generateRandomString, getUserByEmail } = require("./helpers");

const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['hibiki'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");




//check ids of users and urls to return an object with only urls the user created
const urlsForUser = function (id) {

  let privateDatabase = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].urlID === id) {

      privateDatabase[key] = urlDatabase[key];
    }
  }
  return privateDatabase;
};

//seed data for user database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("abc", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("123", 10)
  }
};
//seed data for URL database
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", urlID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", urlID: "user2RandomID" }
};
//landing page
app.get("/", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

//render log in page
app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    const templateVars = { user: user };
    res.render("urls_login", templateVars);
  } else {
    res.redirect("/urls");
  }
});

//login
app.post("/login", (req, res) => {
  const email = req.body.username;
  const loginPassWord = req.body.password;
  const user = getUserByEmail(users, email);

  if (user) {
    if (bcrypt.compareSync(loginPassWord, user.password)) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res.status(403).send("Sorry incorrect password");
    }
  } else {
    res.status(403).send("Sorry, you have entered an invalid email or the user doesn't exist");

  }
});

//logout
app.post("/logout", (req, res) => {

  req.session = null;
  res.redirect("/urls");
});

//register route
app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: user };
    res.render("urls_register", templateVars);
  }
});

//registering user
app.post("/register", (req, res) => {

  const userEmail = req.body.email;
  const UserPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(UserPassword, 10);
  if (!userEmail || !UserPassword) { //check if the password and email fields are filled out
    res.status(400).send("Invalid email or password");
  } else if (getUserByEmail(users, userEmail)) { //check if the email has already been taken
    res.status(400).send("Email already taken");

  } else {
    const userId = generateRandomString(); //generate a random string for the user object
    users[userId] = { id: userId, email: userEmail, password: hashedPassword };
    req.session.user_id = users[userId].id;   
    res.redirect("/urls");
  }
});

//creating a new url
app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    let randomString = generateRandomString(); // to generate a random id for the URLdatabase
    const fullURL = req.body.longURL;
    const templateVars = { shortURL: randomString, longURL: fullURL };
    urlDatabase[templateVars.shortURL] = { longURL: templateVars.longURL, urlID: user["id"] };
    res.redirect(`/urls/${templateVars.shortURL}`);

  } else {
    res.status(403).send("you don't have permission to create an URL, please log in or register");
  }

});

//goes to the creating a new URL form
app.get("/urls/new", (req, res) => {

  const user = users[req.session.user_id];

  if (user) {
    const templateVars = { user: user["email"] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});


//browse the url database
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id]; //set user to get the id only instead of whole users object.

  if (user) {
    let privateDatabase = urlsForUser(user.id); //creates an object of urls that the user made
    const templateVars = { urls: privateDatabase, user: user["email"] };//this makes an object called urls with a single object with the data from the urlDatabase.
    res.render("urls_index", templateVars);
  } else {
    res.status(403).render("urls_relogin");

  }
});


//read a specific url
app.get("/urls/:shortURL", (req, res) => {
  const tinyURL = req.params.shortURL;
  const user = users[req.session.user_id];
  
  if(!urlDatabase.hasOwnProperty(tinyURL)) {
       return res.render("urls_error");
  }
  
  if (user) {

    if (user.id !== urlDatabase[tinyURL].urlID) {
      res.status(403).send("You don't have permission to view that URL");
    } else {
      const templateVars = { shortURL: tinyURL, longURL: urlDatabase[tinyURL].longURL, user: user["email"] };
      res.render("urls_show", templateVars);
    }

  } else {
    res.status(403).send("You need to be logged in to view that URL");
  }
});


//redirect to the actual website from the shortened URL
app.get("/u/:shortURL", (req, res) => {
  const tinyURL = req.params.shortURL;
  
  if(urlDatabase.hasOwnProperty(tinyURL)) {
    const realURL = urlDatabase[tinyURL].longURL;
    res.redirect(realURL);
  } else {
    res.render("urls_error");
  }
});

//edit the URL
app.post("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  const tinyURL = req.params.shortURL;
  const newName = req.body.longURL;
  if (user) {
      if (user.id === urlDatabase[tinyURL].urlID) {
      
      urlDatabase[tinyURL].longURL = newName;
      res.redirect("/urls");
    } else {
     return res.send("You don't have permission to edit the URL");
    }
    
  } else {
    return res.send("You need to be logged in to do that")
  }

});

//delete an URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session.user_id];
  const tinyURL = req.params.shortURL;
  
  if (user) {
    if (user.id === urlDatabase[tinyURL].urlID) {
      
      delete urlDatabase[tinyURL];

    res.redirect("/urls");
  } else {
    res.send("You don't have permission to delete this URL");
  }
  } else {
    res.send("You need to be logged in to do that")
  }
});

//delete path
app.get("/urls/:url/delete", (req, res) => { //if the user tries to delete the URl without being logged in
  res.status(403).send("You need to be logged in and own the URL to delete it");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
