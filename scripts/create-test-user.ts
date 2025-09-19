import dotenv from "dotenv";
dotenv.config();

import { db } from "../server/db";
import { profiles } from "../shared/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

async function createTestUser() {
  try {
    console.log("Creating test user...");

    const email = "test@example.com";
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log("❌ User already exists!");
      console.log("📧 Email:", email);
      console.log("🔑 Password:", password);
      return;
    }

    // Create new test user
    await db.insert(profiles).values({
      email: email,
      firstName: "Test",
      lastName: "User",
      hashedPassword: hashedPassword,
      emailVerified: true,
      role: "user",
      authMethod: "email"
    });

    console.log("✅ Test user created successfully!");
    console.log("📧 Email:", email);
    console.log("🔑 Password:", password);
    console.log("🌐 Login at: http://localhost:8000/login");

  } catch (error) {
    console.error("❌ Error creating test user:", error);
  } finally {
    process.exit(0);
  }
}

createTestUser();