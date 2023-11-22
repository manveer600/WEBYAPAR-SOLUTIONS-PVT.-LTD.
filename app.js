// app.js
const express = require('express');
const databaseconnect = require('./config/databaseConfig.js');
const authRouter = require('./router/authRoute.js');
const app = express();
const cookieParser = require('cookie-parser');
app.use(express.json()); 
app.use(cookieParser());
app.use('/', authRouter);

module.exports = app;

