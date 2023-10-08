const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const dotenv=require("dotenv");

const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000

dotenv.config({path:'./config.env'});

const DB=process.env.DATABASE;

app.use(bodyParser.json());
app.use(cors());

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  contact: Number,
});

const UserModel = mongoose.model("User", userSchema);

function connectToDatabase() {
  // Connect to MongoDB Atlas
  mongoose
    .connect(
      DB,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    )
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error(err));
}

app.get("/", async(req, resp) => {
    try {
        const users = await UserModel.find();
        resp.status(200).json(users);
      } catch (err) { 
        console.error("Error fetching user data:", err);
        resp.status(500).json({ error: "Server error, please try again later." });
      }
});


app.get("/:id",async(req,resp)=>{
    // console.log(req.params.id);
    // UserModel.findById(req.params.id)
    try{
        const user=await UserModel.findById(req.params.id);
        resp.status(200).json(user);
    }
    catch(err){
        console.error("Error fetching user data:", err);
        resp.status(500).json({ error: "Server error, please try again later." });
    }
})

app.delete("/:id",async(req,resp)=>{
    try{
        const user_left=await UserModel.deleteOne({_id:req.params.id});
        resp.status(200).json(user_left);
    }
    catch(err){
        console.log("error in deleting user ",err);
        resp.status(500).json({error:"user data not deleted"});
    }
})

app.post("/", async(req, resp) => {
  const { name, email,contact } = req.body;

  const existingUser=await UserModel.findOne({name});

  if(existingUser){
    resp.status(409).json({error:"username already exists"})
  }

  const user = new UserModel({
    name:req.body.name,
    email:req.body.email,
    contact:req.body.contact
  });

  user.save()
  .then(result=>{
    console.log(result);
    resp.status(200).json({
        msg:"user added successfully",
    })
  })
  
});

// Define your data model and schema here

// Define routes for POST and GET requests

async function startServer() {
  try {
    await connectToDatabase();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log("error occured in starting the server ", error);
  }
}

startServer();
