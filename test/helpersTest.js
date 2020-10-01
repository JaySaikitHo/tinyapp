const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
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
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail( testUsers,"user@example.com")
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user.id,expectedOutput)
  });

});

describe('getUserByEmail', function() {
  it('should return undefined if there is no valid email', function() {
    const user = getUserByEmail( testUsers,"abcd@hotmail.com")
    const expectedOutput = undefined;
    // Write your assert statement here
    assert.equal(user, expectedOutput)
  });

});

