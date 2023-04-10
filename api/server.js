const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const usersRouter = require('./users/users-router')
const authRouter = require('./auth/auth-router')


//this is the storeVVV
const session = require('express-session')
const Store = require('connect-session-knex')(session)
const knex = require('../data/db-config')
//this is the store^^^

/**
  Do what needs to be done to support sessions with the `express-session` package!
  To respect users' privacy, do NOT send them a cookie unless they log in.
  This is achieved by setting 'saveUninitialized' to false, and by not
  changing the `req.session` object unless the user authenticates.

  Users that do authenticate should have a session persisted on the server,
  and a cookie set on the client. The name of the cookie should be "chocolatechip".

  The session can be persisted in memory (would not be adecuate for production)
  or you can use a session store like `connect-session-knex`.
 */


  //NOTE: when a user logs in successfully, the web page sets a cookie to keep track of the user. 
  //the server grabs the cookie and can see if it has a session id that matches the cookie

  //the server maintains an array of logined in users. 

const server = express();


server.use(session({
  name: 'chocolatechip', //<< name of session, this will be name on the cookie
  secret: 'shh', //<< never hard code this
  saveUninitialized: false, 
  resave: false, 
  store: new Store({
    knex,
    createTable: true,
    clearInterval: 1000 * 60 * 10,
    tablename: 'sessions',
    sidfieldname: 'sid',
  }), //<< this new store takes its own configuration object
  cookie: {
    maxAge: 1000 * 60 * 10,
    secure: false, //<< IMPORTANT: if this is set to true, the server will only
    //send a cookie if it is running on https
    httpOnly: true,
    // sameSite: 'none'

  } //<< the configuration of the cookie is very important

})) //in here you pass a configuration file for the session
server.use(helmet());
server.use(express.json());
server.use(cors());

server.use('/api/users', usersRouter)
server.use('/api/auth', authRouter)

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

server.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
});

module.exports = server;
