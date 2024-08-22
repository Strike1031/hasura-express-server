"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const app = (0, express_1.default)();
const port = 3000;
const generateFakeTransactionHash = () => {
    return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};
const generateFakeMethod = () => {
    const methods = ['mint', 'burn', 'swap'];
    return methods[Math.floor(Math.random() * methods.length)];
};
const generateFakeAddress = () => {
    return '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};
const generateFakeDecoded = () => {
    const isSwapIn0 = Math.random() < 0.5;
    const amountIn = Math.floor(Math.random() * 1e9 + 1e6).toString();
    const amountOut = Math.floor(Math.random() * 1e9 + 1e6).toString();
    return {
        to: generateFakeAddress(),
        sender: generateFakeAddress(),
        amount0In: isSwapIn0 ? amountIn : "0",
        amount1In: isSwapIn0 ? "0" : amountIn,
        amount0Out: isSwapIn0 ? "0" : amountOut,
        amount1Out: isSwapIn0 ? amountOut : "0",
    };
};
const pool = new pg_1.Pool({
    connectionString: process.env.PG_DATABASE_URL
});
let lastBlockNumber = Math.floor(Math.random() * 1000000);
const generateNextBlockNumber = () => {
    const increment = Math.floor(Math.random() * 10) + 1; // Random increment between 1 and 10
    lastBlockNumber += increment;
    return lastBlockNumber;
};
const insertRandomLog = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield pool.connect();
    try {
        const query = `
      INSERT INTO logs (transaction_hash, decoded, address, block_number, block_timestamp, "from", "to")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
        const values = [
            generateFakeTransactionHash(),
            JSON.stringify(generateFakeDecoded()),
            generateFakeAddress(),
            generateNextBlockNumber(),
            new Date().toISOString(),
            generateFakeAddress(),
            generateFakeAddress()
        ];
        yield client.query(query, values);
        console.log("Inserted random log into the database");
    }
    catch (error) {
        console.error("Error inserting random log:", error);
        throw error;
    }
    finally {
        client.release();
    }
});
const generateFakeActivities = () => {
    const isBridged = Math.random() < 0.5;
    return isBridged ? "Bridged" : "Transaction";
};
const generateFakePoints = () => {
    const points = Math.floor(Math.random() * 1000) + 1; // Random increment between 1 and 10
    return points;
};
const insertRandomLastActivitiesLog = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield pool.connect();
    try {
        const query = `
      INSERT INTO logs (activity, points, block_timestamp, transaction_hash)
      VALUES ($1, $2, $3, $4)
    `;
        const values = [
            generateFakeActivities(),
            generateFakePoints(),
            new Date().toISOString(),
            generateFakeTransactionHash(),
        ];
        yield client.query(query, values);
        console.log("Inserted random log into the database");
    }
    catch (error) {
        console.error("Error inserting random log:", error);
        throw error;
    }
    finally {
        client.release();
    }
});
app.use(express_1.default.json());
app.get("/push-data", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // await insertRandomLog();
        yield insertRandomLastActivitiesLog();
        res.status(200).json({ message: "Data pushed successfully" });
    }
    catch (error) {
        console.error("Error in /push-data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
