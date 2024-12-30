import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryFormDto } from './dto/create-inventory-form.dto';
import HttpStatusCode from 'src/utils/HttpStatusCode';
import { CreateInventoryAddressDto } from './dto/create-inventory-address.dto';
import { InventoryAdressPageOption } from './dto/get-all-inventory-address.dto';
import { InventoryType } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}
  async createInventory(body: CreateInventoryFormDto) {
    try {
      const { items, type, state, note, expected_date } = body;
      const inventoryForm = await this.prisma.inventoryForm.create({
        data: {
          type,
          state,
          note,
          expected_date,
        },
      });
      Promise.all(
        items.map(async (item) => {
          const book = await this.prisma.books.findUnique({
            where: { sku: item.sku },
          });
          if (!book) {
            throw new HttpException(
              `Book with sku ${item.sku} does not exist`,
              HttpStatusCode.BAD_REQUEST,
            );
          }
          await this.prisma.inventoryFormItem.create({
            data: {
              ...item,
              book_id: book.id,
              inventory_form_id: inventoryForm.id,
            },
          });
        }),
      );
      return inventoryForm;
    } catch (error) {
      throw new HttpException(error.message, HttpStatusCode.BAD_REQUEST);
    }
  }
  async createInventoryAddress(dto: CreateInventoryAddressDto) {
    try {
      const { name, type, address, note } = dto;
      const inventoryAddress = await this.prisma.inventoryAddress.create({
        data: {
          name,
          type,
          address,
          note,
        },
      });
      return inventoryAddress;
    } catch (error) {
      throw new HttpException(error.message, HttpStatusCode.BAD_REQUEST);
    }
  }
  async getAllInventoryAddress(
    query: InventoryAdressPageOption,
    type?: InventoryType,
  ) {
    try {
      const where = type ? { type: type } : {};
      const inventoryAddresses = await this.prisma.inventoryAddress.findMany({
        where,
        skip: query.skip,
        take: query.take,
      });
      const count = await this.prisma.inventoryAddress.count({ where });
      return { inventoryAddresses, count };
    } catch (error) {
      throw new HttpException(error.message, HttpStatusCode.BAD_REQUEST);
    }
  }
  async getAllStockInInventory(query: InventoryAdressPageOption) {
    try {
      const books = await this.prisma.books.findMany({
        skip: query.skip,
        take: query.take,
        orderBy: { updated_at: 'desc' },
      });
      const count = await this.prisma.inventoryAddress.count();
      return { books, count };
    } catch (error) {
      throw new HttpException(error.message, HttpStatusCode.BAD_REQUEST);
    }
  }
}
