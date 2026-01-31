"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const connectDB = async () => {
    let retries = 5;
    while (retries) {
        try {
            await mongoose_1.default.connect(env_1.env.MONGODB_URI);
            console.log('✅ MongoDB Connected successfully');
            break;
        }
        catch (err) {
            console.error(`❌ MongoDB connection error: ${err}`);
            retries -= 1;
            console.log(`Retries left: ${retries}. Waiting 5 seconds...`);
            await new Promise(res => setTimeout(res, 5000));
            if (retries === 0)
                process.exit(1);
        }
    }
};
exports.default = connectDB;
