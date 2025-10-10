import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

let products = [
  { sku:"1001", name:"قهوة عربية 250g", price:28, vat:0.15 },
  { sku:"1002", name:"شاي أسود 100 فتلة", price:16, vat:0.15 },
  { sku:"2001", name:"ماء 330ml", price:2.5, vat:0.15 },
  { sku:"3001", name:"حليب طازج 1L", price:7.5, vat:0.15 },
  { sku:"4001", name:"خبز بر", price:4, vat:0.15 },
  { sku:"5001", name:"تمر سكري 1kg", price:32, vat:0.15 },
];

app.get("/products", (req,res)=>{
  const q = (req.query.q||"").toString();
  if(!q) return res.json(products);
  const f = products.filter(p=> p.name.includes(q) || p.sku.includes(q));
  res.json(f);
});

app.post("/orders", (req,res)=>{
  const order = req.body||{};
  // حفظ بسيط للعرض فقط
  const logLine = JSON.stringify({ ts: new Date().toISOString(), order }) + "\n";
  fs.appendFileSync("orders.log", logLine);
  res.json({ ok:true, id: Date.now() });
});

const port = 4545;
app.listen(port, ()=> console.log("Mock API listening on http://localhost:"+port));