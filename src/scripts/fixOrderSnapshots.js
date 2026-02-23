import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Book from '../models/Book.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const fixOrderSnapshots = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const orders = await Order.find({});
    console.log(`Found ${orders.length} orders to check\n`);

    let fixedCount = 0;

    for (const order of orders) {
      let needsUpdate = false;

      for (const item of order.items) {
        // Check if bookSnapshot is missing or has undefined fields
        if (!item.bookSnapshot || !item.bookSnapshot.title || !item.bookSnapshot.author) {
          // Try to get book from database
          const book = await Book.findById(item.book);

          if (book) {
            // Book exists, use real data
            item.bookSnapshot = {
              title: book.title,
              author: book.author,
              image: book.image
            };
            console.log(`✓ Fixed item in order ${order._id} with book data: ${book.title}`);
          } else {
            // Book doesn't exist, use placeholder
            item.bookSnapshot = {
              title: 'Deleted Book',
              author: 'Unknown Author',
              image: '/placeholder.png'
            };
            console.log(`⚠ Fixed item in order ${order._id} with placeholder (book deleted)`);
          }
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await order.save();
        fixedCount++;
      }
    }

    console.log(`\n=== Fix Complete ===`);
    console.log(`Total orders checked: ${orders.length}`);
    console.log(`Orders fixed: ${fixedCount}`);

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixOrderSnapshots();
