const express = require('express');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config();
const multer = require('multer')

const app = express();
//Add a Mongodb URL
const uri = process.env.MONGODB_URL

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
app.use(express.static('public'))

// rename the user and collection
const database = client.db('electric-demo');
const userList = database.collection('userList');
const productList= database.collection("productList")
const categoryList= database.collection("categoryList")
const subCategoryList= database.collection("subCategoryList")
const ImageList= database.collection("imageList")


app.get('/', (req, res) => {
  res.send('Hello World!');
});

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    return cb(null, "./public/Images")
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}_${file.originalname}`)
  }
})

const upload = multer({storage})

app.post('/upload', upload.single('file'), async(req, res) => {
  const imgName= req.file.filename
  try{
    await ImageList.insertOne({image: imgName})
  }catch(err){
    console.log("failed");
  }
})


// console.log(req.files.length);
app.post('/uploadProduct', upload.array('files'), async(req, res) => {

  const description = JSON.parse(req.body.message)

  try{
    const result= await productList.insertOne({description, images: req.files})
    res.send(result)
  }catch(err){
    res.status(400).send({
      message: 'This is an error uploading Image!'
   });
  }
})

app.get('/get-upload', async(req, res)=>{
  try{
    const users = await ImageList.find({});
    const result = await users.toArray();
    res.send(result);
  }catch(err){
    console.log("failed to find image");
  }
})



// create logged in users collection
app.post("/addUser", async (req, res) => {
  console.log(req.body);
  try {
    const user = req.body;
    console.log(user);
    const filter = { email: user.email };
    const option = { upsert: true };
    const updateDoc = { $set: user };
    const result = await userList.updateOne(filter, updateDoc, option);
    
    res.json(result);
  } catch {
    console.log("Failed to insert user.");
  }
});

// get logged users collection
app.get("/getUser", async (req, res) => {
  try {
    const users = await userList.find({});
    const result = await users.toArray();
    res.send(result);
  } catch (err) {
    console.log("Failed to find users collection");
  }
});

// get logged users collection
app.delete("/deleteUser/:id", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    let user = await userList.findOne({ _id: id });
    if(user?.role){
      delete user.role
    }
    const filter = { _id: id }
    const updateDoc = {
      $set: {
        role:""
      },
    };
    const result =await userList.updateOne(filter, updateDoc);
    console.log(result);
    res.send(result)
  } catch (err) {
    console.log("Failed to delete users collection");
  }
});
// get logged users collection
app.put(`/editUser/:id`, async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const { email, role } = req?.body || {};
    const filter = { email: email };
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        role: role,
      },
    };
    const result = await userList.updateOne(filter, updateDoc, options);
    res.send(result);
  } catch (err) {
    console.log("Failed to find users collection");
  }
});


// product upload
app.post("/uploadProduct", (req, res) => {
  console.log(req.body);
  async function run() {
    try {
      
      const product = req.body;
      const result = await productList.insertOne(product);
      res.json(result);
    } catch (err) {
      console.log("failed to upload a new product");
    }
  }
  run();
});


// category add get and delete
app.get("/getCategory", (req, res) => {
  async function run() {
    try {
      const categories = await categoryList.find({});
      const result = await categories.toArray();
      res.json(result);
    } catch (err) {
      console.log("failed to find category");
    }
  }
  run();
});


app.post("/addCategory", async (req, res) => {
  async function run(){
    try {
      const category = req.body;
      console.log(req.body);
      const result = await categoryList.insertOne(category);
      res.json(result);
    } catch (err) {
      console.log("failed to create Category order");
    }
  }
  run()
});


app.delete("/deleteCategory/:id", async (req, res) => {
  async function run(){
    try {
      const id = new ObjectId(req.params.id);
      const result = await categoryList.deleteOne({ _id: id });
      res.json(result);
    } catch (err) {
      console.log("failed to delete category");
    }
  }
  run()
});



// subCategory add get and delete
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


app.post("/addSubCategory", async (req, res) => {
  async function run(){
    try {
      const subCategory = req.body;
      const result = await subCategoryList.insertOne(subCategory);
      res.json(result);
    } catch (err) {
      console.log("failed to create Sub Category order");
    }
  }
  run()
});

app.delete("/deleteSubCategory/:id", async (req, res) => {
  async function run(){
    try {
      const id = new ObjectId(req.params.id);
      const result = await subCategoryList.deleteOne({ _id: id });
      res.json(result);
    } catch (err) {
      console.log("failed to delete sub category");
    }
  }
  run()
});








// will work on this
app.get("/featuredProduct", (req, res) => {
  async function run() {
    try {
      const products = await productList.find({});
      const result = await products.toArray();
      res.json(result);
    } catch (err) {
      console.log("failed to find");
    }
  }
  run();
});

// get related product
app.get("/relatedProduct", (req, res) => {
  async function run() {
    try {
      const products = productList.find(req.query);
      const result = await products.toArray();
      res.json(result);
    } catch (err) {
      console.log("Failed to Find Related Products.");
    }
  }
  run();
});

// search products
app.get("/searchProducts", (req, res) => {
  async function run() {
    try {
      const products = await productList.find({});
      const result = await products.toArray();
      res.json(result);
    } catch (err) {
      console.log("failed to find");
    }
  }
  run();
});


app.get("/getProducts", (req, res) => {
  async function run() {
    // console.log(req.query);
    let currentPage = req.query?.page;
    let limit = req.query?.limit;
    if (currentPage >= 0) {
      
      try {
        const products = productList
          .find({})
          .limit(currentPage * limit)
        const result = await products.toArray();
        console.log(result.length);
        res.json(result);
      } catch (err) {
        console.log("failed to find");
      }
    } else {
    }
  }
  run();
});

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

app.put("/editProduct/:id", (req, res) => {
  async function run() {
    try {
      const id = new ObjectId(req.params.id);
      const filter = { _id: id };
      const result = await productList.replaceOne(filter, req.body);
      res.json(result);
    } catch (err) {}
  }
  run();
});

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

// confirm order
app.post("/confirmOrder", (req, res) => {
  async function run() {
    try {
      const details = req.body;
      const result = await orderList.insertOne(details);
      res.json(result);
    } catch (err) {
      console.log("failed to Confirmed order");
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

// create blog post
app.post("/blogPost", async (req, res) => {
  try {
    const doc = req.body;
    const result = await blogPost.insertOne(doc);
    res.json(result);
  } catch (err) {
    console.log("Failed to insert blog");
  }
});

// find a single blog post
app.get("/blogPost/:blogId", async (req, res) => {
  try {
    const id = new ObjectId(req.params.blogId);
    const result = await blogPost.findOne({ _id: id });
    res.json(result);
  } catch (err) {
    console.log("Failed to Find a single blog");
  }
});

// find all blog post
app.get("/blogPost", async (req, res) => {
  try {
    const result = blogPost.find();
    const blogs = await result.toArray();
    res.json(blogs);
  } catch (err) {
    console.log("Failed to find all blog");
  }
});

// verify id token middleware
async function verifyIdToken(req, res, next) {
  if (req.headers?.authorization?.startsWith("Bearer ")) {
    const idToken = req.headers.authorization.split("Bearer ")[1];
    try {
      const decodedUser = await admin?.auth()?.verifyIdToken(idToken);
      req.email = decodedUser.email;
    } catch (err) {
      console.log("Error from Verify middleware");
    }
  }
  next();
}

// Find User`s Old Orders
app.get("/myOrders", verifyIdToken, async (req, res) => {
  try {
    const { email } = req.query || {};
    if (email === req?.email) {
      const orders = orderList.find({ email }).sort({ timestamp: -1 });
      const result = await orders.toArray();
      res.json(result);
    }
  } catch (err) {
    res.status(401).json({ message: "User Not Authorized" });
  }
});

// This is for customer order status change
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











app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});