const express = require('express');
const routes = require('./routes/Api');

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api/v1', routes);


app.listen(port);
console.log('The server has started at ' + port);
