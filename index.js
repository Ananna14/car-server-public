const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config()

const app = express ();
const port =process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ojutr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// console.log(uri)

async function run() {
    try {
      await client.connect();
      const database = client.db('car_sales');
      const servicesCollection = database.collection('services');
      const usersCollection = database.collection('users');

    //GET API
    app.get('/services', async(req, res)=>{
        const cursor = servicesCollection.find({});
        const services = await cursor.toArray();
        res.send(services);
    })
      
      //POST API
      app.post('/services', async(req, res)=>{
          const service = req.body;
        console.log('hit the post api', service)
          const result = await servicesCollection.insertOne(service);
          console.log(result)
        res.json(result)
        })

        app.get('/users/:email', async(req, res)=>{
          const email = req.params.email;
          const query = {email: email};
          const user = await usersCollection.findOne(query);
          let isAdmin = false;
          if(user?.role === 'admin'){
          isAdmin=true;
          }
          res.json({admin: isAdmin})
        })

      //email, register save
      app.post('/users', async(req, res)=>{
          const user = req.body;
          const result = await usersCollection.insertOne(user);
          console.log(result)
          res.json(result);

      });

      app.put('/users/admin', async(req, res)=>{
        const user = req.body;
        console.log('put', user)
        const filter = {email: user.email};
        const updateDoc = { $set: { role: 'admin' }};
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);
      })
    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.get('/', (req,res)=>{
    res.send('Running my CRUD Server');
});

app.listen(port, ()=>{
    console.log('Running server on port', port)
})