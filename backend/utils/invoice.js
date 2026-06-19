const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoice = (order, orderItems, user) => {
    return new Promise((resolve, reject) => {
        try {
            // Ensure invoices directory exists
            const invoicesDir = path.join(__dirname, '../invoices');
            if (!fs.existsSync(invoicesDir)) {
                fs.mkdirSync(invoicesDir, { recursive: true });
                console.log('📁 Invoices folder created');
            }

            const filename = `invoice-${order.id}-${Date.now()}.pdf`;
            const filepath = path.join(invoicesDir, filename);
            
            console.log('📄 Generating invoice:', filename);
            
            const doc = new PDFDocument({ margin: 50 });
            const stream = fs.createWriteStream(filepath);
            doc.pipe(stream);

            // Header
            doc.fontSize(20).font('Helvetica-Bold').text('BF Devices Tech', { align: 'center' });
            doc.fontSize(10).font('Helvetica').text('Your Trusted Tech Store', { align: 'center' });
            doc.moveDown();

            // Invoice Title
            doc.fontSize(16).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
            doc.moveDown();

            // Invoice Details
            doc.fontSize(10).font('Helvetica');
            doc.text(`Invoice #: INV-${String(order.id).padStart(6, '0')}`, { align: 'left' });
            doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, { align: 'left' });
            doc.text(`Order #: ${order.id}`, { align: 'left' });
            doc.moveDown();

            // Customer Details
            doc.fontSize(12).font('Helvetica-Bold').text('Customer Details:');
            doc.fontSize(10).font('Helvetica');
            doc.text(`Name: ${user?.name || 'Guest'}`);
            doc.text(`Email: ${user?.email || 'N/A'}`);
            doc.text(`Address: ${order.shipping_address || 'N/A'}`);
            doc.moveDown();

            // Payment Details
            doc.fontSize(12).font('Helvetica-Bold').text('Payment Details:');
            doc.fontSize(10).font('Helvetica');
            doc.text(`Method: Cash on Delivery`);
            doc.text(`Status: ${order.status || 'Pending'}`);
            doc.moveDown();

            // Order Items Table
            doc.fontSize(10).font('Helvetica-Bold');
            const tableTop = doc.y;
            const itemX = 50;
            const qtyX = 350;
            const priceX = 420;
            const totalX = 480;

            doc.text('Item', itemX, tableTop);
            doc.text('Qty', qtyX, tableTop);
            doc.text('Price', priceX, tableTop);
            doc.text('Total', totalX, tableTop);

            doc.moveTo(50, tableTop + 15)
               .lineTo(550, tableTop + 15)
               .stroke();

            doc.font('Helvetica');
            let y = tableTop + 25;

            orderItems.forEach(item => {
                const itemName = item.name || 'Product';
                doc.text(itemName.length > 30 ? itemName.substring(0, 27) + '...' : itemName, itemX, y);
                doc.text(item.quantity, qtyX, y);
                doc.text(`$${item.price.toFixed(2)}`, priceX, y);
                doc.text(`$${(item.price * item.quantity).toFixed(2)}`, totalX, y);
                y += 20;
            });

            y += 10;
            doc.moveTo(50, y)
               .lineTo(550, y)
               .stroke();
            y += 10;

            doc.font('Helvetica-Bold');
            doc.text('Total:', 380, y);
            doc.text(`$${order.total.toFixed(2)}`, totalX, y);
            
            doc.moveDown(2);
            doc.fontSize(10).font('Helvetica');
            doc.text('Thank you for your purchase!', { align: 'center' });
            doc.text('For support, contact us at support@bftech.com', { align: 'center' });

            doc.end();

            stream.on('finish', () => {
                console.log('✅ Invoice saved:', filename);
                resolve({ filename, filepath });
            });

            stream.on('error', (err) => {
                console.error('❌ Stream error:', err);
                reject(err);
            });

        } catch (error) {
            console.error('❌ Invoice generation error:', error);
            reject(error);
        }
    });
};

module.exports = { generateInvoice };