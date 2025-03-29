import mongoose from 'mongoose';

const MONGODB_URI = process.env.ATLAS_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the ATLAS_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// Global cache to support hot reloads in dev and serverless environments
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectToDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'ai-coaching-platform',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    console.log("🌍 Connecting to Mongo with URI:", MONGODB_URI.slice(0, 50) + '...');

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ Mongoose connected successfully");
      // Set up connection event handlers
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        cached.conn = null;
        cached.promise = null;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected');
        cached.conn = null;
        cached.promise = null;
      });

      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
};

// Export connection state for debugging
export const getConnectionState = () => ({
  hasConnection: !!cached.conn,
  hasPromise: !!cached.promise,
  readyState: mongoose.connection.readyState,
});
