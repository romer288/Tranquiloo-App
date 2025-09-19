import dotenv from "dotenv";
dotenv.config();

import { Client } from "pg";

async function checkUserProfile() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log("✅ Connected to database");

    // Check test user profile
    const userResult = await client.query(
      'SELECT id, email, first_name, last_name FROM profiles WHERE email = $1',
      ['test@example.com']
    );

    if (userResult.rows.length > 0) {
      console.log("👤 Test user profile:", userResult.rows[0]);

      const userId = userResult.rows[0].id;

      // Check chat sessions for this user ID
      const sessionsResult = await client.query(
        'SELECT id, user_id, title, created_at FROM chat_sessions WHERE user_id = $1',
        [userId]
      );
      console.log("💬 User's chat sessions:", sessionsResult.rows);

    } else {
      console.log("❌ Test user not found");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

checkUserProfile();