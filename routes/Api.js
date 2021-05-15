require('dotenv').config();
const express = require('express');
const router = express.Router();
const ruleSets = require('../models/rulesets');
const transactions = require('../models/transactions');
const moment = require('moment')
const {isRulesetValid, isTransactionValid} = require('../services/ruleSetValidation')

/**
 * @swagger
 * /api/v1/ruleset:
 *      post:
 *          summary: Add a ruleset for cashback
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              startDate:
 *                                  type: string
 *                                  example: 2021-01-01
 *                              endDate:
 *                                  type: string
 *                                  example: 2021-01-31
 *                              cashback:
 *                                  type: number
 *                                  example: 2.50
 *                              redemptionLimit:
 *                                  type: number
 *                                  example: 10
 *          responses:
 *              '201':
 *                  description: Ruleset Created
 *      
 */

/**Add a ruleset */
router.post('/ruleset', async(req,res) => {
    try {
        console.log(req.body)
        const isValid = isRulesetValid(req.body);
        if(isValid) {
            ruleSets.create({
                ...req.body
            }).then((created) => {
                res.status(201).send(created)
            })
        } else {
            res.status(400).send({
                message:"Invalid Input"
            })
        }
    } catch (error) {
        res.status(400).send({
            message:"Something went wrong."
        })
    }

})

/**
 * @swagger
 * /api/v1/transaction:
 *      post:
 *          summary: Add a transaction
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              transactionDate:
 *                                  type: string
 *                                  example: 2021-01-17
 *                              id:
 *                                  type: number
 *                                  example: 1
 *          responses:
 *              '201':
 *                  description: Transaction accepted
 *      
 */

/**Post a transaction */
router.post('/transaction', async(req,res) => {
    try {
        //assuming that all input are correct

        if(await isTransactionValid(req.body)){
            console.log('got here')
            let query = {
                $and:[
                    {$or:[
                        {startDate:{$lte:(req.body.transactionDate)}},
                        {startDate:{$exists:false}}
                    ]},
                    {$or:[
                        {endDate:{$gte:(req.body.transactionDate)}},
                        {endDate:{$exists:false}}
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
                        res.status(400).send()
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
                        res.status(400).send()
                       }
    
                   }
                }
            })

        } else {
            res.status(400).send({
                message:"Invalid Input"
            })
        }

    } catch (error) {
        console.log(error)
        res.status(400).send({
            message:"Something went wrong."
        })
    }
})


/**
 * @swagger
 * /api/v1/cashback:
 *      get:
 *          summary: Calculate and return a list of transactions qualified for cashback
 *          description: Cashbacks should be calculated for each transaction using each of the rulesets provided previously.
 *          responses:
 *              '201':
 *                  description: OK
 *      
 */

/**Get Cashback */
router.get('/cashback', (req,res) => {
    try {   
        transactions.find({amount:{$gt:0}})
        .select('transactionId amount -_id')
        .limit(50)
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
