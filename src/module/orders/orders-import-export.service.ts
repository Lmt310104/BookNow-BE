import { PrismaService } from '@module/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { format } from 'util';

const ORDER_EXPORT_FIELDS = [
  { header: 'Order ID', key: 'id', mandatory: true, width: 15 },
  { header: 'Date', key: 'createdAt', mandatory: true, width: 15 },
  { header: 'Address', key: 'shippingAddress', mandatory: true, width: 30 },
  { header: 'Latitude', key: 'latitude', mandatory: false, width: 12 },
  { header: 'Longitude', key: 'longitude', mandatory: false, width: 12 },
  { header: 'Customer Name', key: 'customerName', mandatory: false, width: 20 },
  { header: 'Email', key: 'customerEmail', mandatory: false, width: 25 },
  { header: 'Phone', key: 'customerPhone', mandatory: false, width: 15 },
];

@Injectable()
export class OrderImportExportService {
  private readonly logger = new Logger(OrderImportExportService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getProcessingOrdersForExport() {
    try {
      const processingOrders = await this.prisma.orders.findMany({
        where: {
          status: OrderStatus.PROCESSING,
        },
        include: {
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
        const customerName =
          order.full_name || order.user?.full_name || 'Anonymous Customer';

        return {
          id: order.id,
          createdAt: order.created_at,
          shippingAddress: order.address,
          longitude: Number(order.longitude) || null,
          latitude: Number(order.latitude) || null,
          customerName,
          customerPhone: order.phone_number || order.user?.phone || 'N/A',
          customerEmail: order.user?.email || 'N/A',
        };
      });
    } catch (error) {
      this.logger.error(`Error fetching processing orders: ${error.message}`);
      throw new Error(`Failed to fetch processing orders: ${error.message}`);
    }
  }

  async generateExcel(orders: any[], res: Response): Promise<void> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Orders');

      // Define columns from the field configuration
      worksheet.columns = ORDER_EXPORT_FIELDS.map((field) => ({
        header: field.header,
        key: field.key,
        width: field.width,
      }));

      // Style the header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' },
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      orders.forEach((order) => {
        const rowData = {};

        ORDER_EXPORT_FIELDS.forEach((field) => {
          let value = order[field.key];

          // Format date fields
          if (field.key === 'createdAt' && value) {
            value = format(new Date(value), 'yyyy-MM-dd HH:mm');
          }

          // Handle missing mandatory fields
          if (field.mandatory && (value === undefined || value === null)) {
            value = 'N/A';
          }

          rowData[field.key] = value;
        });

        worksheet.addRow(rowData);
      });

      // Apply consistent styling to data rows
      for (let i = 2; i <= orders.length + 1; i++) {
        const row = worksheet.getRow(i);

        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });

        // Alternate row coloring
        if (i % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F2F2F2' },
          };
        }
      }

      // Add auto-filter
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: ORDER_EXPORT_FIELDS.length },
      };

      // Set filename with current date
      const exportDate = new Date();
      const exportFilename = `Orders_for_shipping_${exportDate.getFullYear()}${String(
        exportDate.getMonth() + 1,
      ).padStart(2, '0')}${String(exportDate.getDate()).padStart(2, '0')}.xlsx`;

      // Set headers and send file
      res.set(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${exportFilename}`,
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      this.logger.error(`Error generating Excel: ${error.message}`);
      res.status(500).json({ error: 'Failed to generate Excel file' });
    }
  }
}
