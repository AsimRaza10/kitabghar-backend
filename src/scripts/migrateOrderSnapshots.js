import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Book from '../models/Book.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const migrateOrderSnapshots = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all orders without bookSnapshot data
    const orders = await Order.find({
      'items.bookSnapshot': { $exists: false }
    });

    console.log(`Found ${orders.length} orders to migrate`);

    let updatedCount = 0;
    let failedCount = 0;

    for (const order of orders) {
      try {
        let needsUpdate = false;

        for (const item of order.items) {
          // If bookSnapshot doesn't exist, try to get book data
          if (!item.bookSnapshot) {
            const book = await Book.findById(item.book);

            if (book) {
              // Book exists, create snapshot
              item.bookSnapshot = {
                title: book.title,
                author: book.author,
                image: book.image
              };
              needsUpdate = true;
            } else {
              // Book doesn't exist, create placeholder snapshot
              item.bookSnapshot = {
                title: 'Deleted Book',
                author: 'Unknown Author',
                image: '/placeholder.png'
              };
              needsUpdate = true;
              console.log(`⚠️  Book not found for order ${order._id}, item ${item._id}`);
            }
          }
        }

        if (needsUpdate) {
          await order.save();
          updatedCount++;
          console.log(`✓ Updated order ${order._id}`);
        }
      } catch (error) {
        failedCount++;
        console.error(`✗ Failed to update order ${order._id}:`, error.message);
      }
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Total orders processed: ${orders.length}`);
    console.log(`Successfully updated: ${updatedCount}`);
    console.log(`Failed: ${failedCount}`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

migrateOrderSnapshots();
