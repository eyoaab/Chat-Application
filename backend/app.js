const express = require('express');
const connectDB = require('./configuration/db.config');

const app = express();
app.use(express.json());

const router = app.router();
