

//random string generator for id
const generateRandomString = function(){
  let random = "";
  const characters = 'abcdefghijklmnopqrstuvwxyz1234567890'
  for (let i = 0; i < 6; i++){
    random += characters.charAt(Math.random() * characters.length);
  }
  return random;
}
//check if the user's email exists in the user database
const getUserByEmail = function (usersDB,email){
  for(let key in usersDB){
    if(usersDB[key].email === email ){
       return usersDB[key];
    }
  }
  return undefined;
}




module.exports = {generateRandomString,getUserByEmail}