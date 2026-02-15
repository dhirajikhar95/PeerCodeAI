// Migration script to add role field to existing users
// Run this ONCE to fix existing users without role field

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function migrateUsers() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB");

        // Update all users that don't have a role field to have role: null
        const result = await mongoose.connection.db.collection("users").updateMany(
            { role: { $exists: false } },
            { $set: { role: null } }
        );

        console.log(`✅ Updated ${result.modifiedCount} users to have role: null`);

        // Also update any users with empty string role
        const result2 = await mongoose.connection.db.collection("users").updateMany(
            { role: "" },
            { $set: { role: null } }
        );

        console.log(`✅ Fixed ${result2.modifiedCount} users with empty role`);

        // Show all users and their roles
        const users = await mongoose.connection.db.collection("users").find({}).toArray();
        console.log("\n📋 Current users:");
        users.forEach(u => {
            console.log(`  - ${u.email}: role = ${u.role === null ? "null (needs selection)" : u.role}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

migrateUsers();
