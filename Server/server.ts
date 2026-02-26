import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import router from "./src/routes/routesApp.js";
import passport from 'passport';
import { connectRedis } from "./src/config/redis.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

await connectRedis();

app.use(express.json());
app.use(cors());
app.use(router);
 app.listen(PORT, ()=>{
     console.log(`Server AuBud running on port ${PORT}`)
});