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

const checkOrderData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const order = await Order.findOne({ _id: '699b2dd50ec4d1a1d84fdfb4' });

    if (!order) {
      console.log('Order not found');
      await mongoose.connection.close();
      return;
    }

    console.log('Order ID:', order._id);
    console.log('Number of items:', order.items.length);
    console.log('\nItem details:');

    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      console.log(`\nItem ${i + 1}:`);
      console.log('  Book ID:', item.book);
      console.log('  Has bookSnapshot:', !!item.bookSnapshot);
      if (item.bookSnapshot) {
        console.log('  Snapshot title:', item.bookSnapshot.title);
        console.log('  Snapshot author:', item.bookSnapshot.author);
      }

      // Check if book exists
      const book = await Book.findById(item.book);
      console.log('  Book exists in DB:', !!book);
      if (book) {
        console.log('  Book title:', book.title);
        console.log('  Book author:', book.author);
      }
    }

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkOrderData();
