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

    cached.promise = mongoose.connect(MONGO_URI, opts).then(async (mongoose) => {
      // console.log("✅ Mongoose connected successfully");
      
      // Get database name
      if (mongoose.connection.db) {
        const dbName = mongoose.connection.db.databaseName;
        console.log("📁 Connected to database:", dbName);
        
        // List all collections
        try {
          const collections = await mongoose.connection.db.listCollections().toArray();
          console.log("📋 Available collections:", collections.map(c => c.name).join(", "));
          
          // Count documents in key collections
          for (const collName of ['nycpsstaffs', 'schools', 'teachingLabStaffs', 'bellschedules', 'teacherschedules', 'cycles']) {
            try {
              const count = await mongoose.connection.db.collection(collName).countDocuments();
              console.log(`📈 Collection '${collName}' has ${count} documents`);
            } catch (error) {
              console.error(`❌ Error counting documents in '${collName}':`, error);
            }
          }
        } catch (error) {
          console.error("❌ Error listing collections:", error);
        }
      } else {
        console.warn("⚠️ MongoDB connection established but db object is undefined");
      }
      
      // Set up connection event handlers
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
        cached.conn = null;
        cached.promise = null;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
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
