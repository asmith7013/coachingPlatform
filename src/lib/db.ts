import mongoose from 'mongoose';

const MONGODB_URI = process.env.ATLAS_URI!;

export async function connectToDB() {
    if (mongoose.connection.readyState >= 1) return mongoose.connection;
    return mongoose.connect(MONGODB_URI);
}
