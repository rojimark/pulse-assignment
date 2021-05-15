const moment = require('moment');
const transactions = require('../models/transactions');

const isRulesetValid = (data) => {
    try {
        const isValidStartDate = data.startDate ? moment(data.startDate).isValid() : true
        const isValidEndDate = data.endDate ? moment(data.endDate).isValid() : true
        const isValidRedemptionLimit = data.redemptionLimit && data.redemptionLimit > 0 ? true : false
        const isValidCashback = data.cashback && data.cashback > 0 ? true : false
        
        const isInutValid = isValidStartDate && isValidEndDate && isValidCashback && isValidRedemptionLimit
        return isInutValid
    } catch (error) {
        return false
    }
}

const isTransactionValid = async(data) => {
    try {
        const isValidTransactionDate = moment(data.transactionDate).isValid()
        const isIdValid = await transactions.find({transactionId: data.id})
        console.log('test', isValidTransactionDate)

        const isInputValid = isValidTransactionDate && isIdValid.length < 1
        return isInputValid
    } catch (error) {
        return false
    }
}


module.exports = {
    isRulesetValid,
    isTransactionValid
};
