require('dotenv').config();
const express = require('express');
const router = express.Router();
const ruleSets = require('../models/rulesets');
const transactions = require('../models/transactions');
const moment = require('moment')
const {isEntryValid} = require('../services/validations')

/**Unsubscribe multiple Users */
router.post('/ruleset', (req,res) => {
    try {
        console.log(req.body)
        let newItem = req.body
        let isValid = isEntryValid(newItem)

        if(!isValid.status) {
            res.status(400).send({
                message:isValid.errorMessage
            })
        }
        ruleSets.create({
            startDate: moment(req.body.startDate),
            endDate:moment(req.body.endDate),
            cashback: req.body.cashback,
            redemptionLimit:req.body.redemptionLimit,
        }).then(() => {
            res.status(201).send()
        })
    } catch (error) {
        res.status(400).send({
            message:"Something went wrong."
        })
    }

})

/**Post a transaction */
router.post('/transaction', (req,res) => {
    try {
        //assuming that all input are correct
        console.log(req.body.transactionDate)
        let query = {
            startDate: {$gte:moment(req.body.transactionDate)},
            endDate:{$lte:moment(req.body.transactionDate)},
            redemptionLimit:{$gt:0}
        }

        ruleSets.findOne(
            {query}
        ).then(async(result,error) => {
            if(error) {
                res.status(400).send({
                    message:"Something went wrong."
                })
            } else {
               if(result == null) {
                   console.log('create regular trasaction')
                   try {
                    await transactions.create({
                        transactionId: req.body.id,
                        date:req.body.transactionDate,
                        amount:0
                    })
                    res.status(201).send()
                   } catch (error) {
                    res.status(401).send()
                   }

               } else {
                   try {
                    console.log('create cashback transaction')
                    await transactions.create({
                        transactionId: req.body.id,
                        date:req.body.transactionDate,
                        amount: result.cashback
                    })
                    await ruleSets.updateOne({_id:result._id},{$inc:{redemptionLimit:-1}})

                    res.status(201).send()
                   } catch (error) {
                    res.status(401).send()
                   }

               }
            }
        })


    } catch (error) {
        console.log(error)
        res.status(400).send({
            message:"Something went wrong."
        })
    }
})

module.exports = router;
