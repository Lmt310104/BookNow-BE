import { PrismaService } from '@module/prisma/prisma.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import * as ExcelJS from 'exceljs';

@Injectable()
export class OrderImportExportService {
  private readonly logger = new Logger(OrderImportExportService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getProcessingOrdersForExport() {
    try {
      const processingOrders = await this.prisma.orders.findMany({
        where: {
          status: 'PROCESSING',
        },
        include: {
          OrderItems: {
            include: {
              book: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              full_name: true,
              phone: true,
            },
          },
        },
      });

      return processingOrders.map((order) => {
        // Calculate total quantity
        // const totalQuantity = order.OrderItems.reduce(
        //   (sum, detail) => sum + detail.quantity,
        //   0,
        // );

        // Calculate estimated weight (assuming each book is 0.5kg)
        // const totalWeight = totalQuantity * 0.5;

        // Format customer name
        const customerName = order.user.full_name || 'Anonymous Customer';

        return {
          id: order.id,
          orderNumber: order.id,
          createdAt: order.created_at,
          shippingAddress: order.address,
          longitude: order.longitude || null,
          latitude: order.latitude || null,
          customerName,
          customerPhone: order.phone_number || order.user?.phone,
          customerEmail: order.user?.email,
          totalAmount: order.total_price,
          //   totalQuantity,
          //   totalWeight,
          status: order.status,
          notes: order.note || 'No special instructions',
          paymentStatus: order.status,
        };
      });
    } catch (error) {
      this.logger.error(`Error fetching processing orders: ${error.message}`);
      throw error;
    }
  }

  async generateExcel(orders: any[]): Promise<Buffer> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Processing Orders');

      this.setupExcelFormatting(worksheet);

      this.addOrderDataRows(worksheet, orders);

      const uint8Array = await workbook.xlsx.writeBuffer();
      return Buffer.from(uint8Array);
    } catch (error) {
      this.logger.error(`Error generating Excel: ${error.message}`);
      throw error;
    }
  }

  private setupExcelFormatting(worksheet: ExcelJS.Worksheet) {
    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Order No', key: 'orderNo', width: 15 },
      { header: 'Type', key: 'type', width: 8 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Address', key: 'address', width: 40 },
      { header: 'Location ID', key: 'locationNo', width: 15 },
      { header: 'Location Name', key: 'locationName', width: 30 },
      { header: 'Accept Partial Match', key: 'acceptPartialMatch', width: 20 },
      { header: 'Duration (mins)', key: 'duration', width: 15 },
      { header: 'Weight (kg)', key: 'load1', width: 15 },
      { header: 'Volume (items)', key: 'load2', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Notes', key: 'notes', width: 30 },
    ];

    // Add instructions row
    worksheet.addRow({});
    worksheet.mergeCells('A1:G1');
    worksheet.mergeCells('H1:K1');
    worksheet.mergeCells('L1:Q1');

    worksheet.getCell('A1').value = 'DO NOT EDIT THESE COLUMNS';
    worksheet.getCell('H1').value = 'EDITABLE FOR DELIVERY SCHEDULING';
    worksheet.getCell('L1').value = 'DELIVERY REQUIREMENTS';

    // Style header row
    ['A1', 'H1', 'L1'].forEach((cell) => {
      worksheet.getCell(cell).alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      worksheet.getCell(cell).font = { bold: true, size: 12 };
    });

    worksheet.getCell('A1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEBE7' },
    };

    worksheet.getCell('H1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'EAF9EF' },
    };

    worksheet.getCell('L1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E6F0FF' },
    };

    // Style column headers
    const headerRow = worksheet.getRow(2);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F2F2F2' },
      };
    });
  }

  private addOrderDataRows(worksheet: ExcelJS.Worksheet, orders: any[]) {
    orders.forEach((order) => {
      worksheet.addRow({
        id: order.id,
        orderNo: order.orderNumber,
        type: 'D',
        date: new Date(order.createdAt).toISOString().split('T')[0],
        address: order.shippingAddress,
        locationNo: `LOC-${order.id.substring(0, 6)}`,
        locationName: `Delivery to ${order.customerName}`,
        latitude: order.latitude || null,
        longitude: order.longitude || null,
        acceptPartialMatch: true,
        duration: 30,
        twFrom: '09:00',
        twTo: '18:00',
        status: order.status,
        notes: order.notes || 'Handle with care',
      });
    });

    // Apply styling to data rows
    const rowCount = worksheet.rowCount;
    for (let i = 3; i <= rowCount; i++) {
      // Style different column groups
      for (let j = 1; j <= 7; j++) {
        const cell = worksheet.getCell(i, j);
        cell.font = { color: { argb: '808080' } };
      }

      for (let j = 8; j <= 11; j++) {
        const cell = worksheet.getCell(i, j);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F5FFF8' },
        };
      }

      for (let j = 12; j <= 17; j++) {
        const cell = worksheet.getCell(i, j);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F0F8FF' },
        };
      }
    }
  }
  async updateOrdersFromExcel(buffer: Buffer) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.getWorksheet(1);

      if (!worksheet) {
        throw new BadRequestException('Invalid Excel file format');
      }

      const results = {
        successful: 0,
        failed: 0,
        errors: [],
        updatedOrders: [],
      };

      // Start from row 3 (assuming row 1-2 are headers)
      for (let rowNumber = 3; rowNumber <= worksheet.rowCount; rowNumber++) {
        try {
          const row = worksheet.getRow(rowNumber);

          // Get order ID and new status from the Excel
          const orderId = row.getCell('A').value?.toString().trim();
          const newStatus = row.getCell('P').value?.toString().trim();

          if (!orderId || !newStatus) {
            continue; // Skip if no ID or status
          }

          // Validate the status value
          const validStatuses = [
            'PENDING',
            'PROCESSING',
            'SHIPPED',
            'DELIVERED',
            'CANCELLED',
          ];
          if (!validStatuses.includes(newStatus)) {
            results.failed++;
            results.errors.push(
              `Row ${rowNumber}: Invalid status "${newStatus}"`,
            );
            continue;
          }

          // Update the order status
          const updatedOrder = await this.prisma.orders.update({
            where: { id: orderId },
            data: {
              status: newStatus as OrderStatus,
              updated_at: new Date(),
            },
            include: {
              OrderItems: true,
            },
          });

          results.successful++;
          results.updatedOrders.push({
            id: updatedOrder.id,
            orderNumber: updatedOrder.id,
            status: updatedOrder.status,
            updatedAt: updatedOrder.updated_at,
          });

          // Add any necessary notifications or side effects for status changes
          await this.handleOrderStatusChange(updatedOrder, newStatus);
        } catch (error) {
          results.failed++;
          results.errors.push(`Row ${rowNumber}: ${error.message}`);
          this.logger.error(
            `Error updating order at row ${rowNumber}: ${error.message}`,
          );
        }
      }

      return results;
    } catch (error) {
      this.logger.error(`Excel processing error: ${error.message}`);
      throw error;
    }
  }

  private async handleOrderStatusChange(order: any, newStatus: string) {
    // Handle any side effects when order status changes
    try {
      if (newStatus === 'DELIVERED') {
        this.logger.log(`Order ${order.orderNumber} marked as delivered`);
      }

      if (newStatus === 'CANCELLED') {
        this.logger.log(`Order ${order.orderNumber} has been cancelled`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to process side effects for order ${order.id}: ${error.message}`,
      );
    }
  }

  async importShippingInformation(buffer: Buffer) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.getWorksheet(1);

      if (!worksheet) {
        throw new BadRequestException('Invalid Excel file format');
      }

      const results = {
        successful: 0,
        failed: 0,
        errors: [],
        updatedOrders: [],
      };

      // Process each row (starting from row 3, after headers)
      for (let rowNumber = 3; rowNumber <= worksheet.rowCount; rowNumber++) {
        try {
          const row = worksheet.getRow(rowNumber);

          const orderId = row.getCell('A').value?.toString().trim();
          if (!orderId) continue;

          // Extract shipping-related data from Excel
          const status = row.getCell('H').value?.toString().trim() || null;

          // Convert Excel date to JavaScript Date if it exists
          // Update order with shipping information
          if (status == 'SUCCESS') {
            const updatedOrder = await this.prisma.orders.update({
              where: { id: orderId },
              data: {
                status: OrderStatus.SUCCESS,
              },
            });
            results.successful++;
            results.updatedOrders.push({
              id: updatedOrder.id,
              status: updatedOrder.status,
            });
          } else {
            const updatedOrder = await this.prisma.orders.update({
              where: { id: orderId },
              data: {
                status: OrderStatus.CANCELLED,
              },
            });
            results.updatedOrders.push({
              id: updatedOrder.id,
              status: updatedOrder.status,
            });
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`Row ${rowNumber}: ${error.message}`);
        }
      }
      return results;
    } catch (error) {
      this.logger.error(
        `Error processing shipping information: ${error.message}`,
      );
      throw error;
    }
  }
}
