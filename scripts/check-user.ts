import dotenv from "dotenv";
dotenv.config();

import { Client } from "pg";

async function checkUser() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log("✅ Connected to database");

    const result = await client.query(
      'SELECT email, email_verified, role, first_name, last_name FROM profiles WHERE email = $1',
      ['test@example.com']
    );

    if (result.rows.length > 0) {
      console.log("📋 User data:", result.rows[0]);
    } else {
      console.log("❌ User not found");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

checkUser();