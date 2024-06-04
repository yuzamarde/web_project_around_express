const mongoose = require('mongoose');
const express = require('express');
const { errors } = require('celebrate');
const cors = require('cors');
require('dotenv').config();

const users = require('./routes/users');
const cards = require('./routes/cards');
const userController = require('./controllers/users');

const requestLogger = require('./middlewares/request.log');
const errorLogger = require('./middlewares/error.log');

const app = express();
app.use(express.json());
app.use(requestLogger);
app.use(cors());
app.options('*', cors());
app.use(express.urlencoded({ extended: true }));


// mongoose.connect(process.env.DB_MONGO || 'mongodb://127.0.0.1:27017/aroundb');


const dbUri = 'mongodb://mongo:lYKveMhnnqCaNJJbdgizFpubmZKbpHWD@monorail.proxy.rlwy.net:10522';

mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB', err));

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Server down');
  }, 0);
});
app.post('/signup', (req, res) => {
  userController.createUser(req, res);
});
app.post('/signin', (req, res) => {
  userController.login(req, res);
});

app.use('/users', users);
app.use('/cards', cards);

app.get('/', (req, res) => {
  res.status(200).send('Halo, kembali bekerja :)');
});

app.use(errorLogger);
app.use(errors());

app.use((error, req, res) => res.status(400).send({ message: '404: Source tidak ditemukan' }));

app.use((error, req, res) => res.status(500).send({ message: '500: Kesalahan server' }));

app.use((error, req, res) => {
  res.status(error.statusCode).send({ message: error.message });
});

app.listen(process.env.PORT || 3000);
