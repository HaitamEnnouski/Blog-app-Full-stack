// utils/migrate-data.js
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const Post = require('../models/post-model');
const config = require('../config');

async function migrateData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    console.log('✅ Connected to MongoDB for migration');

    // Read the JSON file
    const jsonPath = path.join(__dirname, '../../data/posts.json');
    const jsonData = await fs.readFile(jsonPath, 'utf8');
    const { posts } = JSON.parse(jsonData);

    console.log(`📊 Found ${posts.length} posts to migrate`);

    // Clear existing posts (optional - comment out if you want to keep existing data)
    await Post.deleteMany({});
    console.log('🗑️ Cleared existing posts');

    // Migrate each post
    const migratedPosts = [];
    for (const post of posts) {
      // Remove the old 'id' field and ensure required fields exist
      const { id, ...postData } = post;
      
      // Ensure tags is an array
      if (!postData.tags || !Array.isArray(postData.tags)) {
        postData.tags = [];
      }

      // Create new post with MongoDB schema
      const newPost = new Post(postData);
      const savedPost = await newPost.save();
      migratedPosts.push(savedPost);
      
      console.log(`✅ Migrated: ${savedPost.title}`);
    }

    console.log(`🎉 Successfully migrated ${migratedPosts.length} posts to MongoDB`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateData();
}

module.exports = migrateData;

