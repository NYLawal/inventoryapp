require('express-async-errors');
require('dotenv').config();

const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const cors = require('cors');
const express = require('express');
const app = express();

const connectDB = require('./src/db/connect')
const productRouter = require('./src/routers/productRouter');
const userRouter = require('./src/routers/userRouter');
const errorHandler= require('./src/middleware/errorHandler')

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cors());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });


if (app.get('env') === 'development' ) {
    app.use(morgan('tiny'))
    console.log('morgan enabled...')
}
app.options('*', cors())
app.use('/api/v1/user', userRouter )
app.use('/api/v1/product', cors(), productRouter)

app.use(errorHandler)

 const port = process.env.PORT || 3000
async function start(){
    try {
        const success = await connectDB(process.env.Mongo_URI)
        if (success) console.log('connected')
        app.listen(port, console.log(`server listening on port ${port}`))
    } catch (error) {
        console.log(error)
    }
}
start()
