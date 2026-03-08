import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import passport from 'passport';

import pool from "./src/config/dbConfig.js";
import { connectRedis } from "./src/config/redis.js";
import { generateKeyPair } from "./src/utils/helpers/RSA.js";
import router from "./src/routes/routesApp.js";
import { initMarketScheduler } from "./src/config/scheduler.js";
import { MarketService } from "./src/services/applicationService/WebDataScrapService.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

await connectRedis();

if (!process.env.RSA_PRIVATE_KEY || !process.env.RSA_PUBLIC_KEY){
    const { publicKey, privateKey } = generateKeyPair();
    console.log("=== COPY VÀO .env ===");
    console.log("RSA_PUBLIC_KEY=" + publicKey.replace(/\n/g, "\\n"));
    console.log("RSA_PRIVATE_KEY=" + privateKey.replace(/\n/g, "\\n"));
    console.log("====================");

    process.exit(0);
}

const marketService    = new MarketService(pool);

app.use(express.json());
app.use(cors());
app.use(router);

 app.listen(PORT, async()=>{
    //  await initMarketScheduler(marketService);
     console.log(`Server AuBud running on port ${PORT}`)
});