import { PrismaService } from '@module/prisma/prisma.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OptimoRouteSDKProvider } from 'src/common/providers/optimo-route.provider';
import * as ExcelJS from 'exceljs';
import { OptimoRouteOrderDto } from './dto/optimo-route-order.dto';
import { formatDateOnly } from 'src/utils/date';
import { Response } from 'express';

@Injectable()
export class DeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly optimoRouteSDKProvider: OptimoRouteSDKProvider,
  ) {}
  async importOrdersFromExcel(file: Express.Multer.File) {
    try {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      const originalName = file.originalname;
      if (!originalName.endsWith('.xlsx') && !originalName.endsWith('.xls')) {
        throw new HttpException(
          'Only Excel files (.xlsx, .xls) are allowed',
          HttpStatus.BAD_REQUEST,
        );
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file.buffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new HttpException(
          'Excel file does not contain any worksheet',
          HttpStatus.BAD_REQUEST,
        );
      }

      const headers = {};
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        headers[cell.value?.toString().trim()] = colNumber;
      });

      const requiredColumns = ['Order ID', 'Address'];
      for (const col of requiredColumns) {
        if (!headers[col]) {
          throw new HttpException(
            `Required column "${col}" is missing from the Excel file`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const orders: OptimoRouteOrderDto[] = [];
      let rowCount = 0;
      let processedCount = 0;
      let skippedCount = 0;
      const deliveryDate = formatDateOnly(new Date());

      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);

        if (row.cellCount === 0) continue;

        rowCount++;

        const orderId = row.getCell(headers['Order ID']).value?.toString();
        const address = row.getCell(headers['Address']).value?.toString();

        const latitude = headers['Latitude']
          ? parseFloat(
              row.getCell(headers['Latitude']).value?.toString() || '0',
            )
          : null;
        const longitude = headers['Longitude']
          ? parseFloat(
              row.getCell(headers['Longitude']).value?.toString() || '0',
            )
          : null;
        const email = headers['Email']
          ? row.getCell(headers['Email']).value?.toString()
          : null;
        const phone = headers['Phone']
          ? row.getCell(headers['Phone']).value?.toString()
          : null;
        if (!orderId || !address) {
          skippedCount++;
          continue;
        }

        const order: OptimoRouteOrderDto = {
          orderNo: orderId,
          date: deliveryDate,
          duration: 15,
          type: 'D',
          location: {
            address: address,
            locationName: address || `Order ${orderId}`,
          },
          notificationPreference: email ? 'email' : phone ? 'sms' : null,
        };

        if (latitude && longitude) {
          order.location.latitude = latitude;
          order.location.longitude = longitude;
        }

        if (email) {
          order.email = email;
        }

        if (phone) {
          order.phone = phone;
        }

        orders.push(order);
        processedCount++;
      }

      if (orders.length === 0) {
        throw new HttpException(
          'No valid orders found in the Excel file',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.optimoRouteSDKProvider.createBulkOrders(orders);

      return {
        success: result.status === 'OK',
        message:
          result.status === 'OK'
            ? 'Orders successfully imported to OptimoRoute'
            : result.message || 'Failed to import orders',
        totalRows: rowCount,
        processedOrders: processedCount,
        skippedRows: skippedCount,
        details: result.orders
          ? {
              successCount: result.orders.filter((o) => o.status === 'OK')
                .length,
              errorCount: result.orders.filter((o) => o.status !== 'OK').length,
              errors: result.orders
                .filter((o) => o.status !== 'OK')
                .map((o) => ({
                  orderNo: o.orderNo,
                  error: o.message,
                })),
            }
          : null,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to process Excel file: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async planningRoutes(date: Date) {
    return await this.optimoRouteSDKProvider.startPlanning({
      date: formatDateOnly(date),
    });
  }

  async getPlaningResults(date: Date) {
    return await this.optimoRouteSDKProvider.getRoute(
      {
        date: formatDateOnly(date),
      },
      true,
    );
  }

  async getScheduledOrderById(orderId: string) {
    const scheduleInfo =
      await this.optimoRouteSDKProvider.getScheduleInfomation(orderId);
    if (!scheduleInfo) {
      throw new HttpException(
        'No schedule information found for the given order ID',
        HttpStatus.NOT_FOUND,
      );
    }
    return scheduleInfo;
  }

  async exportOrdersToExcelForEveryDriver(date: Date, res: Response) {
    const routesData = await this.optimoRouteSDKProvider.getRoute(
      {
        date: formatDateOnly(date),
      },
      true,
    );
    await exportDriverRoutesToExcel(routesData, res);
  }
}

// Move this function outside the class
async function exportDriverRoutesToExcel(
  routesData: any,
  res: Response,
): Promise<void> {
  try {
    const workbook = new ExcelJS.Workbook();

    const summarySheet = workbook.addWorksheet('Summary');

    summarySheet.columns = [
      { header: 'Driver Name', key: 'driverName', width: 20 },
      { header: 'Vehicle', key: 'vehicle', width: 15 },
      { header: 'Stops', key: 'stops', width: 10 },
      { header: 'Total Distance (km)', key: 'distance', width: 20 },
      { header: 'Duration (min)', key: 'duration', width: 15 },
    ];

    // Style the header row of summary sheet
    const summaryHeader = summarySheet.getRow(1);
    summaryHeader.font = { bold: true, color: { argb: 'FFFFFF' } };
    summaryHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' },
    };
    summaryHeader.alignment = { vertical: 'middle', horizontal: 'center' };

    for (const route of routesData.routes) {
      summarySheet.addRow({
        driverName: route.driverName,
        vehicle: route.vehicleRegistration,
        stops: route.stops.length,
        distance: (route.distance / 1000).toFixed(2),
        duration: route.duration,
      });

      const driverSheet = workbook.addWorksheet(`Driver ${route.driverSerial}`);

      driverSheet.mergeCells('A1:G1');
      const titleCell = driverSheet.getCell('A1');
      titleCell.value = `Route for ${route.driverName} - ${formatDateOnly(new Date())}`;
      titleCell.font = { bold: true, size: 16 };
      titleCell.alignment = { horizontal: 'center' };

      driverSheet.mergeCells('A2:G2');
      const vehicleCell = driverSheet.getCell('A2');
      vehicleCell.value = `Vehicle: ${route.vehicleRegistration} (${route.vehicleLabel})`;
      vehicleCell.font = { italic: true };
      vehicleCell.alignment = { horizontal: 'center' };

      driverSheet.mergeCells('A3:G3');
      const summaryCell = driverSheet.getCell('A3');
      summaryCell.value = `Total: ${route.stops.length} stops, ${(route.distance / 1000).toFixed(2)} km, ${route.duration} min`;
      summaryCell.font = { bold: true };
      summaryCell.alignment = { horizontal: 'center' };

      driverSheet.addRow([]);

      driverSheet.columns = [
        { header: 'Stop #', key: 'stopNumber', width: 8 },
        { header: 'Order ID', key: 'orderNo', width: 36 },
        { header: 'Scheduled Time', key: 'scheduledAt', width: 12 },
        { header: 'Location Address', key: 'address', width: 40 },
        { header: 'Location Name', key: 'locationName', width: 30 },
        { header: 'Distance', key: 'distance', width: 12 },
        { header: 'Travel Time', key: 'travelTime', width: 12 },
      ];

      driverSheet.addRow([]);

      const headerRow = driverSheet.getRow(5);
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' },
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      headerRow.height = 20;
      headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' },
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      route.stops.forEach((stop) => {
        driverSheet.addRow({
          stopNumber: stop.stopNumber,
          orderNo: stop.orderNo,
          scheduledAt: stop.scheduledAt,
          address: stop.address,
          locationName: stop.locationName,
          distance:
            stop.distance > 1000
              ? `${(stop.distance / 1000).toFixed(2)} km`
              : `${stop.distance} m`,
          travelTime: `${Math.floor(stop.travelTime / 60)}:${(stop.travelTime % 60).toString().padStart(2, '0')}`,
        });
      });

      for (let i = 6; i < 6 + route.stops.length; i++) {
        const row = driverSheet.getRow(i);

        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });

        if (i % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F2F2F2' },
          };
        }
      }

      driverSheet.addRow([]);
      const mapUrlRow = driverSheet.addRow(['Map URL:']);
      mapUrlRow.font = { bold: true };

      if (route.routePolyline) {
        const origin = `${route.stops[0].latitude},${route.stops[0].longitude}`;
        const destination = `${route.stops[route.stops.length - 1].latitude},${route.stops[route.stops.length - 1].longitude}`;

        const waypoints = route.stops
          .slice(1, -1)
          .map((stop) => `${stop.latitude},${stop.longitude}`)
          .join('|');

        const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${encodeURIComponent(waypoints)}`;

        driverSheet.addRow([mapUrl]);
      }

      driverSheet.addRow([]);
    }

    for (let i = 2; i <= routesData.routes.length + 1; i++) {
      const row = summarySheet.getRow(i);

      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      if (i % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F2F2F2' },
        };
      }
    }

    const exportDate = formatDateOnly(new Date());
    const filename = `Driver_Routes_${exportDate}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting routes to Excel:', error);
    throw new Error(`Failed to export routes to Excel: ${error.message}`);
  }

  /**
   * Export driver routes to Excel file with each driver on a separate worksheet
   * @param routesData The routes data returned from OptimoRoute
   * @param res Express Response object to send the Excel file
   */
}
