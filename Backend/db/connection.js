import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoUrl= process.env.MONGO_URL || "mongodb://localhost:27017/cyclebay";
mongoose.connect(mongoUrl)
.then(()=>console.log("Connected to Database"))
.catch((err)=>console.log("Error connecting to database",err));