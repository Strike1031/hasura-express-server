import express from 'express';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

const generateFakeTransactionHash = (): string => {
  return '0x' + Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

const generateFakeAddress = (): string => {
  return '0x' + Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

const pool = new Pool({
  connectionString: process.env.PG_DATABASE_URL
});


const generateFakeActivities = (): string => {
  const isBridged = Math.random() < 0.5;
  return isBridged ? "Bridged" : "Transaction"
}

const generateFakePoints = (): number => {
    const points = Math.floor(Math.random() * 1000) + 1; // Random increment between 1 and 10
    return points;
}

const insertRandomLog = async () => {
  const client = await pool.connect();
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

    await client.query(query, values);
    console.log("Inserted random log into the database");
  } catch (error) {
    console.error("Error inserting random log:", error);
    throw error;
  } finally {
    client.release();
  }
}

app.use(express.json());

app.get("/push-data", async (req, res) => {
  try {
    await insertRandomLog();
    res.status(200).json({ message: "Data pushed successfully" });
  } catch (error) {
    console.error("Error in /push-data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
