import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import HttpStatusCode from 'src/utils/HttpStatusCode';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}
  async createInventory(body: CreateInventoryDto) {
    try {
      const { bookId, quantity, sellingPrice, entryPrice } = body;
      await this.prisma.books.findFirstOrThrow({
        where: { id: bookId },
      });
      const inventory = await this.prisma.inventory.create({
        data: {
          book_id: body.bookId,
          stock: quantity,
          selling_price: sellingPrice,
          entry_price: entryPrice,
        },
      });
      return inventory;
    } catch (error) {
      throw new HttpException(error.message, HttpStatusCode.BAD_REQUEST);
    }
  }
}
