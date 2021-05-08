const express = require('express');
const routes = require('./routes/Api');
const volleyball = require('volleyball');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express')

const app = express();
const port = process.env.PORT || 5001;


const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info:{
            title:'Cashback API',
            description:'REST API that calculates the cashback for some transactions based on the rulesets provided.',
            servers:["http://localhost:5001/api/v1/"]
        }
    },
    apis: ['./routes/*.js']
}

const swaggerDocs = swaggerJsDoc(options);

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(volleyball)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))
app.use('/api/v1', routes);


app.listen(port);
console.log('The server has started at ' + port);
