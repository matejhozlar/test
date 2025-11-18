import bcrypt from "bcrypt";
import { queries } from "../db/index.js";

const createAdmin = async () => {
  const username = process.argv[2] || "admin";
  const password = process.argv[3] || "Admin123!";

  try {
    const existingUser = queries.getUserByUsername.get(username);
    if (existingUser) {
      console.error(`User ${username} already exists`);
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    queries.createUser.run(username, passwordHash, 1);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
};

createAdmin();
