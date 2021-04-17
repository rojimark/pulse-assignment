var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// connect to db

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true,useFindAndModify: false ,useUnifiedTopology: true, promiseLibrary: global.Promise });

var transactionsSchema = Schema(
  {
    transactionId:{type:String, unique:true},
    date:{type:Date},
    amount:{type:Number}
  },
  {
    timestamps: true
  }
);
var transaction = (module.exports = mongoose.model('transaction', transactionsSchema));
