import { Body, Controller, Post } from '@nestjs/common';
import { END_POINTS } from 'src/utils/constants';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { StandardResponse } from 'src/utils/response.dto';
import { InventoryService } from './inventory.service';

const {
  INVENTORY: { BASE, GET_ALL, CREATE, UPDATE, GET_ONE, ACTIVE, INACTIVE },
} = END_POINTS;
@Controller(BASE)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}
  @Post(CREATE)
  async create(@Body() data: CreateInventoryDto) {
    const result = await this.inventoryService.createInventory(data);
    return new StandardResponse(result, 'Inventory created successfully', 201);
  }
}
