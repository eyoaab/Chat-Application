const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./configuration/db.config');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

connectDB();

const userRoute = require('./routes/user.routes');
const chatRoute = require('./routes/chat.routes');
const messageRoute = require('./routes/message.routes');

app.use('/users', userRoute);
app.use('/chats', chatRoute);
app.use('/messages', messageRoute);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});


module.exports = app;
