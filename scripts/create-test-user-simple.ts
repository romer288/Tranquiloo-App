import dotenv from "dotenv";
dotenv.config();

import { Client } from "pg";
import * as bcrypt from "bcryptjs";

async function createTestUser() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL + "&sslmode=require"
  });

  try {
    await client.connect();
    console.log("✅ Connected to database");

    const email = "test@tranquiloo.com";1
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM profiles WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log("❌ User already exists!");
      console.log("📧 Email:", email);
      console.log("🔑 Password:", password);
      return;
    }

    // Create new test user
    await client.query(`
      INSERT INTO profiles (
        email,
        first_name,
        last_name,
        hashed_password,
        email_verified,
        role,
        auth_method
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      email,
      "Test",
      "User",
      hashedPassword,
      true,
      "user",
      "email"
    ]);

    console.log("✅ Test user created successfully!");
    console.log("📧 Email:", email);
    console.log("🔑 Password:", password);
    console.log("🌐 Login at: http://localhost:8000/login");

  } catch (error) {
    console.error("❌ Error creating test user:", error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

createTestUser(); 