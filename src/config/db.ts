import mongoose from "mongoose";

const URI = process.env.MONGODB_URI;

export async function establishDatabase() {
    mongoose.connection.once("connected", () => {
        console.info("INFO | Database connected!");
    });

    if (!URI) {
        throw new Error("'MONGODB_URL' was missing in the .env");
    }

    try {
        await mongoose.connect(URI);
    } catch {
        console.error("INFO | Issue connecting to database...");
    }
}

establishDatabase();