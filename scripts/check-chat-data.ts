import dotenv from "dotenv";
dotenv.config();

import { Client } from "pg";

async function checkChatData() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log("✅ Connected to database");

    // Check chat sessions
    const sessionsResult = await client.query(
      'SELECT COUNT(*) as count FROM chat_sessions'
    );
    console.log("📊 Total chat sessions:", sessionsResult.rows[0].count);

    // Check recent chat sessions
    const recentSessions = await client.query(
      'SELECT id, user_id, title, ai_companion, created_at FROM chat_sessions ORDER BY created_at DESC LIMIT 5'
    );
    console.log("📋 Recent chat sessions:", recentSessions.rows);

    // Check chat messages
    const messagesResult = await client.query(
      'SELECT COUNT(*) as count FROM chat_messages'
    );
    console.log("💬 Total chat messages:", messagesResult.rows[0].count);

    // Check recent messages
    const recentMessages = await client.query(
      'SELECT id, session_id, user_id, content, sender, created_at FROM chat_messages ORDER BY created_at DESC LIMIT 10'
    );
    console.log("📨 Recent messages:", recentMessages.rows);

    // Check test user sessions
    const testUserSessions = await client.query(
      'SELECT id, title, ai_companion, created_at FROM chat_sessions WHERE user_id = $1',
      ['test@example.com']
    );
    console.log("🧪 Test user sessions:", testUserSessions.rows);

    // Check anxiety analyses
    const analysesResult = await client.query(
      'SELECT COUNT(*) as count FROM anxiety_analyses'
    );
    console.log("🧠 Total anxiety analyses:", analysesResult.rows[0].count);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

checkChatData();