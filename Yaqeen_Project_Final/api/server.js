import express from "express";
import cors from "cors";
const app = express();
app.use(cors()); app.use(express.json());
app.get("/health", (req,res)=>res.json({status:"ok", at:new Date().toISOString()}));
app.get("/api/ping", (req,res)=>res.json({message:"pong"}));
app.listen(4545, ()=>console.log("API up on http://localhost:4545"));
