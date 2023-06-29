const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbpath = path.join(__dirname, "twitterClone.db");
let db = null;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
app.use(express.json());

const initalizeAndCreateServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`Error Message:${e.message}`);
    process.exit(1);
  }
};
initalizeAndCreateServer();

//API 1
app.post("/register/", async (request, response) => {
  const { username, password, name, gender } = request.body;

  const selectUserQuery = `select * from user where username="${username}"`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser !== undefined) {
    response.status(400);
    response.send("User already exists");
  } else {
    if (password.lenghth < 6) {
      response.status(600);
      response.send("Password is too short");
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const postUserQuery = `INSERT INTO user (username,password,name,gender) 
                values ("${username}","${hashedPassword}","${name}","${gender}")`;
      await db.run(postUserQuery);
      response.status(200);
      response.send("User created successfully");
    }
  }
});

//API 2

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `select * from user where username=${username}`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isMatchedPassword = await bcrypt.compare(password, dbUser.password);
    if (isMatchedPassword === false) {
      response.status(400);
      response.send("Invalid password");
    } else {
      const payload = { username, userId: dbUser.user_id };
      const jwtToken = jwt.sign(payload, "rakesh");
      response.send({ jwtToken });
    }
  }
});
