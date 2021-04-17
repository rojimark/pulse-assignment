require('dotenv').config();
const express = require('express');
const router = express.Router();
const ruleSets = require('../models/rulesets');
const transactions = require('../models/transactions');
const moment = require('moment')

/**Unsubscribe multiple Users */
router.post('/ruleset', (req,res) => {
    try {
        console.log(req.body)

        ruleSets.create({
            startDate: req.body.startDate,
            endDate:req.body.endDate,
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
            $and:[
                {$or:[
                    {startDate:{$lte:(req.body.transactionDate)}},
                    {startDate:{$exists:false}}
                ]},
                {$or:[
                    {endDate:{$gte:(req.body.transactionDate)}},
                    {startDate:{$exists:false}}
                ]},
                {$or:[
                    {redemptionLimit:{$gt:0}},
                    {redemptionLimit:{$exists:false}}
                ]}
            ]
        }

        ruleSets.findOne(query).sort({cashback:-1})
        .then(async(result,error) => {
            console.log(result)
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
                    await ruleSets.updateOne({_id:result._id,redemptionLimit: {$exists: true}},{$inc:{redemptionLimit:-1}})

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

/**Get Cashback */
router.get('/cashback', (req,res) => {
    try {   
        transactions.find({amount:{$gt:0}})
        .select('transactionId amount -_id')
        .then((result,error)  => {
                if(error){
                    console.log(error)
                    res.status(400).send({
                        message:"Something went wrong."
                    })
                }
                else {
                    res.status(201).send(result)
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
