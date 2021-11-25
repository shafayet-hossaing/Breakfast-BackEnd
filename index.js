const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


// Middleware
app.use(cors())
app.use(express.json())


// MongoDb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.khkjp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// Run Function
const run = async () => {
    try{
        await client.connect();
        const database = client.db("FoodDelivery")
        const FoodDeliveryCollection = database.collection("FoodDeliveryCollection")
        const orderCollection = database.collection("Orders")



        // POST API FOR ADDING NEW SERVICE
        app.post('/addService', async (req, res) => {
            const service = req.body
            const result = await FoodDeliveryCollection.insertOne(service)
            res.send(result)
        })



        // GET API FOR GETTING SERVICES
        app.get('/getServices', async (req, res) => {
            const result = await FoodDeliveryCollection.find({}).toArray()
            res.json(result)
        })



        // SINGLE DATA LOAD
        app.get('/singleDataLoad/:id', async (req, res) => {
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const result = await FoodDeliveryCollection.findOne(query)
            res.send(result)
        })



        // SINGLE DATA POST API UNDER EMAIL
        app.post('/orderedData', async (req, res) => {
            const service = req.body
            console.log(service);
            const result = await orderCollection.insertOne(service)
            res.send(result)
        })




        // ORDERED DATA LOADING BY EMAIL
        app.get('/orderedDataLoad/:email', async (req, res) => {
            const query = req.params.email
            const result = await orderCollection.find({email: query}).toArray()
            const productId = result.map(info => ObjectId(info.productId))
            const orders =  await FoodDeliveryCollection.find({_id: {$in: productId}}).toArray()
            res.send(orders)
        })



        // Manage Orders 
        app.get('/getAllOrders', async (req, res) => {
            const result = await orderCollection.find({}).toArray()
            const productId = result.map(info => ObjectId(info.productId))
            const orders = await FoodDeliveryCollection.find({_id: {$in: productId}}).toArray()
            res.send([result, orders])
        })




        // Delete
        app.delete('/deleteOrders/:id', async (req, res) => {
            console.log(req.body);
            const id = req.params.id
            const getTheIds = await orderCollection.deleteOne({productId: id})
            res.send(getTheIds)
        })



        // Approve The Pending
        app.put('/approve/:id', async (req, res) => {
            const query = req.params.id
            const result = await orderCollection.updateOne({productId: query},{
                $set: {orderStatus: "Approved"}
            })
            console.log(result);
            res.json(result)
        })

    }finally{
        // await client.close()
    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send("All Right")
})


app.listen(port, () => {
    console.log("Listening To Port ", port);
})