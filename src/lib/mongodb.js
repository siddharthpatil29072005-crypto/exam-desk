import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = (async () => {
      let uri = process.env.MONGODB_URI;
      
      // If no URI is provided, spin up an in-memory MongoDB for development
      if (!uri) {
        console.warn("MONGODB_URI not found. Starting a local in-memory MongoDB server...");
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        const mongoServer = await MongoMemoryServer.create();
        uri = mongoServer.getUri();
        console.warn("Connected to in-memory MongoDB: " + uri);
      }

      return mongoose.connect(uri, opts).then((mongoose) => mongoose);
    })();
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
