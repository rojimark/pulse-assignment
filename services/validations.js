require('dotenv').config()
const moment = require('moment');

// To validate if ruleSet entries
const isEntryValid = (newItem) => {
    try {
        if( !moment(newItem.endDate).isValid() ||!moment(newItem.startDate).isValid()) {
            return  ({status:false, message:"Please enter a valid date for endDate and startDate."})
        }else if(moment(newItem.endDate).isBefore(moment(newItem.startDate))) {
            return  ({status:false, message:"End date must be after start date."})
        } else if(newItem.cashback <= 0) {
            return  ({status:false, message:"Cashback amount can't be 0 or less."})
        } else if(newItem.redemptionLimit <= 0) {
            return  ({status:false, message:"Redemption Limi can't be 0 or less."})
        } else {
            return ({status:true, message:"All entries are valid."})
        }
    } catch (error) {
        return ({status:false, message:"Something went wrong."})
    }
}


module.exports = {
    isEntryValid,
};
