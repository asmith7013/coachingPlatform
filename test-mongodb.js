const mongoose = require('mongoose');

// Get the connection string from environment
const MONGO_URI = "mongodb+srv://asmith7013:pnz0uvb5ztj_qxj0EXQ@coaching.go309.mongodb.net/ai-coaching-platform";

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...');
  console.log('🔗 Connection string (masked):', MONGO_URI.replace(/:[^:@]+@/, ':****@'));
  
  try {
    console.log('⏳ Connecting to MongoDB...');
    
    const connection = await mongoose.connect(MONGO_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('📁 Database name:', connection.connection.db.databaseName);
    console.log('🌍 Connection state:', mongoose.connection.readyState);
    
    // List collections
    const collections = await connection.connection.db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    // Test a simple query
    const admin = connection.connection.db.admin();
    const serverStatus = await admin.serverStatus();
    console.log('🖥️ MongoDB server version:', serverStatus.version);
    console.log('🏠 Server host:', serverStatus.host);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    if (error.codeName) {
      console.error('Error code name:', error.codeName);
    }
    
    // Common error types and their meanings
    if (error.message.includes('authentication failed')) {
      console.error('🔐 Authentication issue - check username and password');
    } else if (error.message.includes('serverSelectionTimeoutMS')) {
      console.error('⏰ Server selection timeout - check network connectivity and cluster status');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('🌐 DNS resolution failed - check cluster URL');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('🚫 Connection refused - check if MongoDB service is running');
    }
    
    process.exit(1);
  }
}

testConnection();
