import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { WithId, Document } from 'mongodb';

// Import the existing connection utility
import { connectToDB } from '@/lib/data-server/db/connection';

// Define result type to avoid type errors
type QueryResult = 
  | { collection: string; count: number; sample: WithId<Document>[] }
  | { collection: string; error: string };

export async function GET() {
  try {
    console.log("🔍 DEBUG: Starting direct MongoDB test");
    
    // Connect to database using existing connection utility
    await connectToDB();
    console.log("🔍 DEBUG: connectToDB completed");
    
    // Check if connection and db are available
    if (!mongoose.connection || !mongoose.connection.db) {
      throw new Error("Database connection not established");
    }
    
    // Log connection details
    console.log("🔍 DEBUG: Connection state:", mongoose.connection.readyState);
    console.log("🔍 DEBUG: Database name:", mongoose.connection.db.databaseName);
    
    // Direct collection access - bypassing models completely
    const db = mongoose.connection.db;
    console.log("🔍 DEBUG: Got database handle");
    
    // Get all collection names
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log("🔍 DEBUG: Available collections:", collectionNames);
    
    // Directly query several collections
    const results = await Promise.all([
      // Try to get staff directly
      db.collection('nycpsstaffs').find({}).limit(5).toArray()
        .then(data => ({ collection: 'nycpsstaffs', count: data.length, sample: data.slice(0, 2) }))
        .catch(err => ({ collection: 'nycpsstaffs', error: err instanceof Error ? err.message : String(err) })),
      
      // Try to get schools directly
      db.collection('schools').find({}).limit(5).toArray()
        .then(data => ({ collection: 'schools', count: data.length, sample: data.slice(0, 2) }))
        .catch(err => ({ collection: 'schools', error: err instanceof Error ? err.message : String(err) })),
        
      // Try cycles collection
      db.collection('cycles').find({}).limit(5).toArray()
        .then(data => ({ collection: 'cycles', count: data.length, sample: data.slice(0, 2) }))
        .catch(err => ({ collection: 'cycles', error: err instanceof Error ? err.message : String(err) }))
    ]) as QueryResult[];
    
    console.log("🔍 DEBUG: Query results:", 
      results.map(r => `${r.collection}: ${('count' in r) ? r.count : 'ERROR'}`).join(', ')
    );
    
    // Return comprehensive debug information
    return NextResponse.json({
      message: "Direct MongoDB collection test",
      connectionState: {
        readyState: mongoose.connection.readyState,
        status: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
        dbName: mongoose.connection.db.databaseName
      },
      availableCollections: collectionNames,
      directQueryResults: results,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isVercel: !!process.env.VERCEL,
        vercelEnv: process.env.VERCEL_ENV
      }
    });
  } catch (error: unknown) {
    console.error("❌ DEBUG ERROR:", error);
    
    // Return detailed error information
    return NextResponse.json({
      message: "MongoDB diagnostic test failed",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      connectionState: mongoose.connection ? {
        readyState: mongoose.connection.readyState,
        status: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
      } : 'No connection established'
    }, { status: 500 });
  }
} 