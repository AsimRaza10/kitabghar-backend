import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Book from '../models/Book.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const testInvoiceGeneration = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the first order
    const order = await Order.findOne()
      .populate('user', 'name email')
      .populate('items.book');

    if (!order) {
      console.log('No orders found in database');
      await mongoose.connection.close();
      return;
    }

    console.log(`\nGenerating invoice for order: ${order._id}`);
    console.log(`Customer: ${order.user.name}`);
    console.log(`Total: $${order.total.toFixed(2)}`);
    console.log(`Items: ${order.items.length}`);

    // Generate PDF
    const result = await generateInvoicePDF(order, order.user);

    console.log(`\n✓ Invoice generated successfully!`);
    console.log(`File: ${result.fileName}`);
    console.log(`Path: ${result.filePath}`);

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testInvoiceGeneration();
