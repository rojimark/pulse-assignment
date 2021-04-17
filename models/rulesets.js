var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true,useFindAndModify: false ,useUnifiedTopology: true, promiseLibrary: global.Promise });

var ruleSetsSchema = Schema(
  {
    startDate: { type: Date, required:true },
    endDate:{type: Date, required:true },
    cashback: {type: Number},
    redemptionLimit: { type: Number },
  },
  {
    timestamps: true
  }
);
var ruleSet = (module.exports = mongoose.model('ruleSet', ruleSetsSchema));
