require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('TaskLance is here!')
})
const uri = `mongodb+srv://${process.env.FREELANERDB_USER}:${process.env.FREELANERDB_PASS}@cluster0.udgfocl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const freelancerMarketplaceDB = client.db("freelancerMarketplaceDB")
    const taskCollection = freelancerMarketplaceDB.collection("taskCollection");


    app.get("/freelancerTask", async (req, res) => {
      const taskData = await taskCollection.find().toArray();
      res.send(taskData);
    })

    app.get("/freelancerTask/:taskId", async (req, res) => {
      const id = req.params.taskId;
      const query = { _id: new ObjectId(id) }

      const taskDetails = await taskCollection.findOne(query);
      res.send(taskDetails);
    })

    app.get("/featuredTasks", async (req, res) => {
      const sortFields = { deadlineDate: 1 }
      const taskData = await taskCollection.find().sort(sortFields).limit(6).toArray();
      res.send(taskData)
    })

    app.post("/myPostedTasks", async (req, res) => {
      const { email } = req.body;
      const query = { clientEmail: email }

      const postedTaskData = await taskCollection.find(query).toArray();
      res.send(postedTaskData);
    })


    app.post('/addTask', async (req, res) => {
      const taskDetails = req.body;
      taskDetails.bidsCount = 0;

      const query = taskDetails;
      const doesTaskExist = await taskCollection.findOne(query);

      let result;
      if (doesTaskExist) {
        result = { duplicate: true }
      }
      else {
        result = await taskCollection.insertOne(taskDetails);
      }

      res.send(result)
    })

    app.put('/myPostedTasks', async (req, res) => {
      const newData = req.body;
      const { _id, ...updateData } = newData;
      const query = { _id: new ObjectId(_id) };

      const updateDoc = {
        $set: updateData
      }

      const result = await taskCollection.updateOne(query, updateDoc)
      res.send(result);
    })

    app.patch('/addBids', async (req, res) => {
      const taskData = req.body;
      console.log(taskData);
      const query = { _id: new ObjectId(taskData._id) }

      const updatedData = {
        $set: {
          bidsCount: taskData.bidsCount
        }
      }

      const result = await taskCollection.updateOne(query, updatedData);
      res.send(result);

      console.log(result)
    })

    app.delete('/freelancerTask/:taskId', async (req, res) => {
      const id = req.params.taskId;

      const query = { _id: new ObjectId(id) }
      const result = await taskCollection.deleteOne(query);
      res.send(result)
      //  console.log(query)
    })

  } finally { }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log("Freelancer task marketplace is running on port", port);
})