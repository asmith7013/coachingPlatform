import mongoose from 'mongoose';

const MONGO_URI = process.env.DATABASE_URL;

if (!MONGO_URI) {
  throw new Error('Missing DATABASE_URL - please define it in your .env files');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}


// Global cache to support hot reloads in dev and serverless environments
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectToDB = async () => {
  if (cached.conn) {
    // console.log("🔄 Using cached connection");
    // console.log("📊 Connection readyState:", mongoose.connection.readyState);
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    // console.log(`🌍 Connecting to MongoDB (${process.env.NODE_ENV} environment)`);
    // Log connection string with masked password
    // const maskedURI = MONGO_URI.replace(/:[^:@]+@/, ':****@');
    // console.log("🔗 Connection string:", maskedURI);

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
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
    console.error("❌ Connection failed:", e);
    cached.promise = null;
    throw e;
  }
};

// Export connection state for debugging
export const getConnectionState = () => {
  const state = {
    hasConnection: !!cached.conn,
    hasPromise: !!cached.promise,
    readyState: mongoose.connection.readyState,
    // Convert readyState to human-readable format
    status: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
  };
  
  console.log("🔍 Connection state:", JSON.stringify(state));
  return state;
};
