const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('morgan');

const indexRouter = require('./routes/index');

const app = express();
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(`Error: ${err.code} : ${err.message}`);
});

module.exports = app;
