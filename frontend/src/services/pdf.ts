import jsPDF from 'jspdf';
import { Challan } from '../types';

export function generateChallanPDF(challan: Challan) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header Banner
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('APEX ERP OPERATIONS', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('SALES CHALLAN / DELIVERY NOTE', 14, 28);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(challan.challanNumber, pageWidth - 14, 20, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Status: ${challan.status}`, pageWidth - 14, 28, { align: 'right' });

  // Company & Customer Details Section
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Details:', 14, 52);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${challan.customerSnapshot.name}`, 14, 60);
  doc.text(`Business: ${challan.customerSnapshot.businessName}`, 14, 66);
  doc.text(`Mobile: ${challan.customerSnapshot.mobile}`, 14, 72);
  doc.text(`Email: ${challan.customerSnapshot.email}`, 14, 78);
  if (challan.customerSnapshot.gstNumber) {
    doc.text(`GSTIN: ${challan.customerSnapshot.gstNumber}`, 14, 84);
  }

  // Right column: Issue details
  const rightColX = 120;
  doc.setFont('helvetica', 'bold');
  doc.text('Challan Metadata:', rightColX, 52);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date Created: ${new Date(challan.createdAt).toLocaleDateString()}`, rightColX, 60);
  doc.text(`Created By: ${challan.createdBy}`, rightColX, 66);
  doc.text(`Customer Type: ${challan.customerSnapshot.type}`, rightColX, 72);

  // Table Headers
  const startY = 96;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, startY, pageWidth - 28, 10, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('#', 18, startY + 7);
  doc.text('Item Description', 30, startY + 7);
  doc.text('SKU', 95, startY + 7);
  doc.text('Qty', 130, startY + 7);
  doc.text('Unit Price', 150, startY + 7);
  doc.text('Total (INR)', pageWidth - 18, startY + 7, { align: 'right' });

  // Table Rows
  let currentY = startY + 12;
  doc.setFont('helvetica', 'normal');

  challan.items.forEach((item, index) => {
    doc.text(String(index + 1), 18, currentY);
    doc.text(item.productSnapshot.name.substring(0, 32), 30, currentY);
    doc.text(item.productSnapshot.sku, 95, currentY);
    doc.text(String(item.quantity), 130, currentY);
    doc.text(`Rs. ${item.unitPrice.toLocaleString()}`, 150, currentY);
    doc.text(`Rs. ${item.lineTotal.toLocaleString()}`, pageWidth - 18, currentY, { align: 'right' });

    currentY += 8;
  });

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.line(14, currentY, pageWidth - 14, currentY);
  currentY += 8;

  // Summary Totals
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Items Quantity: ${challan.totalQuantity}`, 120, currentY);
  currentY += 6;
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Grand Total: Rs. ${challan.totalAmount.toLocaleString()}`, 120, currentY);

  // Footer Note
  currentY += 25;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('This is a computer-generated Sales Challan. Goods once dispatched cannot be returned without prior authorization.', 14, currentY);

  // Save File
  doc.save(`${challan.challanNumber}_Invoice.pdf`);
}
