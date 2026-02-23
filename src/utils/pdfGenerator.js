import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateInvoicePDF = (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const fileName = `invoice-${order._id}.pdf`;
      const filePath = path.join(process.cwd(), 'invoices', fileName);

      // Create invoices directory if it doesn't exist
      const invoicesDir = path.join(process.cwd(), 'invoices');
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Colors
      const primaryColor = '#ea580c'; // Orange-600
      const secondaryColor = '#dc2626'; // Red-600
      const darkGray = '#111827';
      const mediumGray = '#6b7280';
      const lightGray = '#f9fafb';
      const borderGray = '#e5e7eb';

      // Modern Header with gradient background
      doc.rect(0, 0, 612, 140).fill('#fff5f0');

      // Decorative orange bar at top
      doc.rect(0, 0, 612, 8).fill(primaryColor);

      // Company Logo/Name with modern styling
      doc.fontSize(36)
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .text('KitabGhar', 50, 35);

      // Tagline
      doc.fontSize(11)
        .fillColor(mediumGray)
        .font('Helvetica')
        .text('Your Trusted Bookstore', 50, 75);

      // Company details in smaller text
      doc.fontSize(9)
        .fillColor(mediumGray)
        .text('123 Book Street, Reading City, RC 12345', 50, 95)
        .text('Email: support@kitabghar.com  |  Phone: (555) 123-4567', 50, 110);

      // Invoice Title with modern badge style
      doc.roundedRect(380, 35, 165, 45, 8).fillAndStroke(primaryColor, primaryColor);

      doc.fontSize(24)
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .text('INVOICE', 380, 48, { align: 'center', width: 165 });

      // Invoice details in modern card
      doc.roundedRect(380, 90, 165, 75, 8).fillAndStroke('#ffffff', borderGray);

      doc.fontSize(8)
        .fillColor(mediumGray)
        .font('Helvetica')
        .text('INVOICE NUMBER', 390, 100);

      doc.fontSize(11)
        .fillColor(darkGray)
        .font('Helvetica-Bold')
        .text(`#${order._id.toString().slice(-8).toUpperCase()}`, 390, 113);

      doc.fontSize(8)
        .fillColor(mediumGray)
        .font('Helvetica')
        .text('DATE ISSUED', 390, 130);

      doc.fontSize(10)
        .fillColor(darkGray)
        .font('Helvetica')
        .text(new Date(order.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }), 390, 143);

      // Status badge
      const statusColor =
        order.status === 'Delivered' ? '#10b981' :
        order.status === 'Shipped' ? '#8b5cf6' :
        order.status === 'Confirmed' ? '#3b82f6' :
        order.status === 'Processing' ? '#f59e0b' :
        order.status === 'Cancelled' ? '#ef4444' : mediumGray;

      doc.roundedRect(50, 115, 80, 22, 11).fill(statusColor);

      doc.fontSize(9)
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .text(order.status.toUpperCase(), 50, 121, { align: 'center', width: 80 });

      // Bill To Section with modern card design
      doc.roundedRect(50, 180, 240, 150, 10).fillAndStroke('#ffffff', borderGray);

      // Card header
      doc.rect(50, 180, 240, 35).fill(lightGray);
      doc.roundedRect(50, 180, 240, 35, 10).fillAndStroke(lightGray, borderGray);

      doc.fontSize(11)
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .text('BILL TO', 65, 192);

      doc.fontSize(11)
        .fillColor(darkGray)
        .font('Helvetica-Bold')
        .text(order.shippingAddress.fullName, 65, 225);

      doc.fontSize(9)
        .fillColor(mediumGray)
        .font('Helvetica')
        .text(order.shippingAddress.email, 65, 243)
        .text(order.shippingAddress.phone, 65, 258)
        .text(order.shippingAddress.address, 65, 278, { width: 210 })
        .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`, 65, 298)
        .text(order.shippingAddress.country, 65, 313);

      // Payment Info Section with modern card design
      doc.roundedRect(305, 180, 240, 150, 10).fillAndStroke('#ffffff', borderGray);

      // Card header
      doc.rect(305, 180, 240, 35).fill(lightGray);
      doc.roundedRect(305, 180, 240, 35, 10).fillAndStroke(lightGray, borderGray);

      doc.fontSize(11)
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .text('PAYMENT INFO', 320, 192);

      doc.fontSize(9)
        .fillColor(mediumGray)
        .font('Helvetica')
        .text('Payment Method', 320, 230);

      doc.fontSize(11)
        .fillColor(darkGray)
        .font('Helvetica-Bold')
        .text(order.paymentMethod, 320, 245);

      doc.fontSize(9)
        .fillColor(mediumGray)
        .font('Helvetica')
        .text('Payment Status', 320, 270);

      if (order.isPaid) {
        doc.roundedRect(320, 285, 60, 20, 10).fill('#d1fae5');

        doc.fontSize(9)
          .fillColor('#10b981')
          .font('Helvetica-Bold')
          .text('PAID', 320, 290, { align: 'center', width: 60 });

        doc.fontSize(8)
          .fillColor(mediumGray)
          .font('Helvetica')
          .text(`on ${new Date(order.paidAt).toLocaleDateString()}`, 320, 310);
      } else {
        doc.roundedRect(320, 285, 70, 20, 10).fill('#fee2e2');

        doc.fontSize(9)
          .fillColor('#ef4444')
          .font('Helvetica-Bold')
          .text('UNPAID', 320, 290, { align: 'center', width: 70 });
      }

      // Items Table with modern design
      const tableTop = 360;

      // Table header with gradient
      doc.roundedRect(50, tableTop, 495, 30, 8).fill(primaryColor);

      doc.fontSize(10)
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .text('ITEM DESCRIPTION', 65, tableTop + 10)
        .text('QTY', 350, tableTop + 10)
        .text('PRICE', 410, tableTop + 10)
        .text('AMOUNT', 475, tableTop + 10);

      // Table items with modern styling
      let yPosition = tableTop + 45;
      let itemIndex = 0;

      order.items.forEach((item) => {
        const itemTotal = item.quantity * item.price;
        const rowHeight = 40;

        // Use bookSnapshot if book is null (deleted book)
        const bookData = item.book || item.bookSnapshot;
        const title = bookData?.title || 'Unknown Book';
        const author = bookData?.author || 'Unknown Author';

        // Alternate row background with rounded corners
        if (itemIndex % 2 === 0) {
          doc.roundedRect(50, yPosition - 8, 495, rowHeight, 6).fill(lightGray);
        }

        // Item number badge
        doc.circle(65, yPosition + 8, 10).fill(primaryColor);
        doc.fontSize(8)
          .fillColor('#ffffff')
          .font('Helvetica-Bold')
          .text((itemIndex + 1).toString(), 60, yPosition + 4);

        // Book title
        doc.fontSize(10)
          .fillColor(darkGray)
          .font('Helvetica-Bold')
          .text(title, 85, yPosition, { width: 240, ellipsis: true });

        // Author
        doc.fontSize(8)
          .fillColor(mediumGray)
          .font('Helvetica-Oblique')
          .text(`by ${author}`, 85, yPosition + 15, { width: 240, ellipsis: true });

        // Quantity, Price, Total
        doc.fontSize(10)
          .fillColor(darkGray)
          .font('Helvetica')
          .text(item.quantity.toString(), 350, yPosition + 8, { align: 'center', width: 40 })
          .text(`$${item.price.toFixed(2)}`, 410, yPosition + 8)
          .font('Helvetica-Bold')
          .text(`$${itemTotal.toFixed(2)}`, 475, yPosition + 8);

        yPosition += rowHeight + 5;
        itemIndex++;
      });

      // Summary section with modern card
      yPosition += 15;
      doc.roundedRect(330, yPosition, 215, 130, 10).fillAndStroke('#ffffff', borderGray);

      yPosition += 20;
      doc.fontSize(10)
        .fillColor(mediumGray)
        .font('Helvetica')
        .text('Subtotal', 345, yPosition)
        .fillColor(darkGray)
        .font('Helvetica-Bold')
        .text(`$${order.subtotal.toFixed(2)}`, 475, yPosition, { align: 'right', width: 60 });

      yPosition += 22;
      doc.fillColor(mediumGray)
        .font('Helvetica')
        .text('Shipping Fee', 345, yPosition)
        .fillColor(darkGray)
        .font('Helvetica-Bold')
        .text(`$${order.shippingCost.toFixed(2)}`, 475, yPosition, { align: 'right', width: 60 });

      yPosition += 22;
      doc.fillColor(mediumGray)
        .font('Helvetica')
        .text('Tax (10%)', 345, yPosition)
        .fillColor(darkGray)
        .font('Helvetica-Bold')
        .text(`$${order.tax.toFixed(2)}`, 475, yPosition, { align: 'right', width: 60 });

      // Divider line
      yPosition += 18;
      doc.moveTo(345, yPosition)
        .lineTo(535, yPosition)
        .strokeColor(borderGray)
        .lineWidth(1)
        .stroke();

      // Total with gradient background
      yPosition += 15;
      doc.roundedRect(330, yPosition - 8, 215, 38, 8).fill(primaryColor);

      doc.fontSize(14)
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .text('TOTAL', 345, yPosition + 5)
        .fontSize(18)
        .text(`$${order.total.toFixed(2)}`, 475, yPosition + 3, { align: 'right', width: 60 });

      // Notes section
      yPosition += 60;
      if (yPosition < 650) {
        doc.roundedRect(50, yPosition, 280, 60, 8).fillAndStroke(lightGray, borderGray);

        doc.fontSize(9)
          .fillColor(primaryColor)
          .font('Helvetica-Bold')
          .text('NOTES', 65, yPosition + 12);

        doc.fontSize(8)
          .fillColor(mediumGray)
          .font('Helvetica')
          .text('Thank you for choosing KitabGhar! We hope you enjoy', 65, yPosition + 30)
          .text('your books. Happy reading!', 65, yPosition + 42);
      }

      // Modern Footer
      const footerY = 720;
      doc.rect(0, footerY, 612, 72).fill(darkGray);

      doc.fontSize(11)
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .text('Thank you for your business!', 50, footerY + 15, { align: 'center', width: 512 });

      doc.fontSize(8)
        .fillColor('#9ca3af')
        .font('Helvetica')
        .text('Questions? Contact us at support@kitabghar.com or call (555) 123-4567', 50, footerY + 35, { align: 'center', width: 512 })
        .text('This is a computer-generated invoice. No signature required.', 50, footerY + 52, { align: 'center', width: 512 });

      doc.end();

      stream.on('finish', () => {
        resolve({ filePath, fileName });
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};
