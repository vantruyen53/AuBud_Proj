import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import router from "./src/routes/routesApp.js";
import passport from 'passport';
import { connectRedis } from "./src/config/redis.js";
import { generateKeyPair } from "./src/utils/helpers/RSA.js";

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

app.use(express.json());
app.use(cors());
app.use(router);

 app.listen(PORT, ()=>{
     console.log(`Server AuBud running on port ${PORT}`)
});