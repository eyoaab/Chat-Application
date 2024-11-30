const express = require('express');
const connectDB = require('./configuration/db.config');

const app = express();
app.use(express.json());

const router = app.router();

const userRoute = require('./routes/user.routes');
const chatRoute = require('./routes/chat.routes');
const messageRoute = require('./routes/message.routes');

connectDB();
