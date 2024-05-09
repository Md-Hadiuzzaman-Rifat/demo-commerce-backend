const express = require("express");
const cors = require("cors");
const { ObjectId } = require("mongodb");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const multer = require("multer");
const fs = require('fs');

const app = express();
//Add a Mongodb URL
const uri = process.env.MONGODB_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// You must install CORS()
app.use(cors());
app.use(express.json());
app.use(express.static("public"));


// rename the user and collection
const database = client.db("nahin-commerce");
const userList = database.collection("userList");
const productList = database.collection("productList");
const categoryList = database.collection("categoryList");
const subCategoryList = database.collection("subCategoryList");
const ImageList = database.collection("imageList");
const clientList = database.collection("clientList")
const orderList= database.collection("orderList")
const garbageList= database.collection("garbageList")

// keep multiple image through multer 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      return cb(null, "./public/Images");
    },
    filename: function (req, file, cb) {
      return cb(null, `${Date.now()}_${file.originalname}`);
    },
  });
  
  const upload = multer({ storage });
  

  // create category with single image 
  app.post("/createCategory", upload.single("file"), async (req, res) => {
    const imgName = req.file.filename;
    const text = req.body.category;
    try {
      await ImageList.insertOne({ image: imgName, category: text });
    } catch (err) {
      console.log("failed in single image category upload");
    }
  });

  // Get categories
app.get("/getCategories", async (req, res) => {
    try {
      const users = await ImageList.find({});
      const result = await users.toArray();
      res.send(result);
    } catch (err) {
      console.log("failed to find image");
    }
  });
  
  
// delete category item with image
app.delete("/category/:imageName", async(req, res) => {
    const imageName = req.params.imageName;
    const imagePath = `./public/Images/${imageName}`;
    try{
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Failed to delete image" });
        }
      });
      await  ImageList.deleteOne({image:imageName});
    }catch(err){
      res.json({ message: "Image deleted successfully" })
    }
  });

  // add new product and multiple images
  app.post("/uploadProduct", upload.array("files"), async (req, res) => {
    const description = JSON.parse(req.body.message);
    try {
      await productList.insertOne({
        description,
        images: req.files,
      });
      res.status(200).json({ status: "ok" });
    } catch (err) {
      res.status(400).send({
        message: "This is an error uploading Product!",
      });
    }
  });
  
// Edit Product Details
  app.put("/editProduct/:id", (req, res) => {
    async function run() {
      try {
        const id = new ObjectId(req.params.id);
        const filter = { _id: id };
        const result = await productList.replaceOne(filter, req.body);
       
        res.status(200).json({ status: "ok" });
      } catch (err) {
        res.status(400).send({
          message: "This is an error Edit Product!",
        });
      }
    }
    run();
  });

// get all Products
app.get("/getProducts", (req, res) => {
    console.log("hitted");
    async function run() {
      try {
        const products =await productList.find({});
        const result = await products.toArray();
        res.json(result);
      } catch (err) {
        console.log("failed to find all Products");
      }
    }
    run();
  });

  // delete Single Product 
  app.delete("/getProducts/:id", (req, res) => {
    async function run() {
      try {
        const id = new ObjectId(req.params.id);
        const result = await productList.deleteOne({ _id: id });
        res.json(result);
      } catch (err) {
        res.send("Failed to upload");
      }
    }
    run();
  });
  
  
// get multiple product
app.post("/getSelectedProduct", async (req, res) => {
    try {
      const data = req.body;
      const objectId = data.map((d) => new ObjectId(d));
      const query = { _id: { $in: objectId } };
      const result = await productList.find(query).toArray();
      res.send(result);
    } catch {
      console.log("Failed");
    }
  });
  
  
  // get single product
app.get("/getProduct/:id", (req, res) => {
    async function run() {
      try {
        const id = new ObjectId(req.params.id);
        const result = await productList.findOne({ _id: id });
        res.json(result);
      } catch (err) {
        console.log("failed to find");
      }
    }
    run();
  });
  


  // create logged in users collection
app.post("/addClient", async (req, res) => {
    try {
      const user = req.body;
      const filter = { phone: user.phone };
      const option = { upsert: true };
      const updateDoc = { $set: user };
      const result = await clientList.updateOne(filter, updateDoc, option);
      res.status(200).json({ status: "ok" });
    } catch (err) {
      res.status(400).send({
        message: "Failed to insert client",
      });
    }
  });

// get All Subcategory
app.get("/getSubCategory", (req, res) => {
    async function run() {
      try {
        const subCategories = await subCategoryList.find({});
        const result = await subCategories.toArray();
        res.json(result);
      } catch (err) {
        console.log("failed to find Sub category");
      }
    }
    run();
  });
  
  // Create  new subcategory
  app.post("/addSubCategory", async (req, res) => {
    async function run() {
      try {
        const subCategory = req.body;
        const result = await subCategoryList.insertOne(subCategory);
        res.json(result);
      } catch (err) {
        console.log("failed to create Sub Category order");
      }
    }
    run();
  });
  

  // Delete Subcategory
app.delete("/deleteSubCategory/:id", async (req, res) => {
    async function run() {
      try {
        const id = new ObjectId(req.params.id);
        const result = await subCategoryList.deleteOne({ _id: id });
        res.json(result);
      } catch (err) {
        console.log("failed to delete sub category");
      }
    }
    run();
  });
  
  

// create a new order
app.post("/confirmOrder", (req, res) => {
    console.log(req.body);
    async function run() {
      try {
        const details = req.body;
        const result = await orderList.insertOne(details);
        console.log(result);
        res.status(200).send(result);
      } catch (err) {
        console.log("failed to confirm order");
        res.status(400).send({
          message: "This is an error OrderConfirmation",
        });
      }
    }
    run();
  });
  
  
// Find ordered product from database
app.get("/orderedProduct", async (req, res) => {
    try {
      const products = orderList.find({}).sort({ timestamp: -1 });
      const result = await products.toArray();
      res.json(result);
    } catch (err) {
      console.log("Failed to load ordered product.");
    }
  });
  

// Find single order product
app.get("/singleOrder/:orderId", async (req, res) => {
    try {
      const id = new ObjectId(req.params.orderId);
      const result = await orderList.findOne({ _id: id });
      res.json(result);
    } catch (err) {
      console.log("Failed to load single Ordered product.");
    }
  });
  
// edit order status
app.put("/singleOrder", async (req, res) => {
    try {
      const { status, id } = req.body;
      console.log(status, id);
      const _id = new ObjectId(id);
      const filter = { _id };
      const updateDoc = {
        $set: {
          status: status,
        },
      };
      const result = await orderList.updateOne(filter, updateDoc);
      res.send(result);
    } catch (err) {
      console.log("Failed to change status");
    }
  });


// Garbage collection GET 
app.get("/getGarbage", async (req, res) => {
    try {
      const garbage = await garbageList.find({});
      const result = await garbage.toArray();
      res.send(result);
    } catch (err) {
      console.log("failed to find garbage collection");
    }
  });
  
  // Delete data from garbage collection
  app.delete("/deleteGarbage/:id", async (req, res) => {
    console.log(req.params.id);
    try {
      const id = new ObjectId(req.params.id);
      let result = await garbageList.deleteOne({ _id: id });
      console.log(result);
      res.end()
    } catch (err) {
      console.log("failed to Delete from garbage collection.");
    }
  });
  

  // work on garbage collection 
  app.put('/garbageTrash', async(req, res)=>{
    console.log("hit put");
    const {id, images}= req.body || {}
    console.log(req.body.id);
    try{
      const ans =await  garbageList.insertMany(images)
      res.json("good from edit")
      }catch(err){
      console.log("Failed to add in garbage.");
    }
  })
  
  app.delete('/garbage/:garbageId', async(req, res)=>{
    console.log("hit delete ");
    const _id = new ObjectId(req.params.garbageId);
    try{
      const ans = await productList.deleteOne({ _id: _id });
      res.json("good from delete")
      }catch(err){
      console.log("Failed to Delete garbage.");
    }
  })
  // garbage collection end


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});

// nahin-electric-demo
// 01910803372
