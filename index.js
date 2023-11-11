const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require('dotenv').config();
const app = express();
const port = process.env.PORT;

app.use(express.json({limit: '50mb'}));
app.use(cors());

app.post("/upload", async (req, res) => {
  try {
    const image = req.body.image;
    const name = req.body.name;

    const uri = `mongodb+srv://${process.env.DbUserName}:${encodeURIComponent(process.env.DbPasswd)}@cluster0.p4htmk9.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();

    const database = client.db("SunmicaDataBase");
    const collection = database.collection("AllSunmicas");

    const document = { name: name, image: image };
    const result = await collection.insertOne(document);

    console.log("Document inserted with _id:", result.insertedId);

    res.status(200).send("Image uploaded successfully");
  } catch (err) {
    console.error("Failed to upload image", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/getImages", async(req, res) => {
    try {    
        const uri = `mongodb+srv://${process.env.DbUserName}:${encodeURIComponent(process.env.DbPasswd)}@cluster0.p4htmk9.mongodb.net/?retryWrites=true&w=majority`;
        const client = new MongoClient(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
    
        await client.connect();
    
        const database = client.db("SunmicaDataBase");
        const collection = database.collection("AllSunmicas");
    
        const data = await collection.find({}).toArray();
        res.json(data);
        console.log(data);

      } catch (err) {
        console.error("Error getting the data", err);
        res.status(500).send("Internal Server Error");
      }
});


app.use(require('./router/color'));
app.use(require('./router/pattern'));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
