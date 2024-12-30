import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { END_POINTS } from 'src/utils/constants';
import { CreateInventoryFormDto } from './dto/create-inventory-form.dto';
import { StandardResponse } from 'src/utils/response.dto';
import { InventoryService } from './inventory.service';
import { CreateInventoryAddressDto } from './dto/create-inventory-address.dto';
import { PageResponseMetaDto } from 'src/utils/page-response-meta.dto';
import { InventoryAdressPageOption } from './dto/get-all-inventory-address.dto';
import { PageResponseDto } from 'src/utils/page-response.dto';
import { InventoryType } from '@prisma/client';

const {
  INVENTORY: {
    BASE,
    GET_ALL,
    CREATE,
    UPDATE,
    GET_ONE,
    ACTIVE,
    INACTIVE,
    CREATE_INVENTORY_ADDRESS,
    GET_ALL_INVENTORY_ADDRESS,
  },
} = END_POINTS;
@Controller(BASE)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}
  @Post(CREATE)
  async create(@Body() data: CreateInventoryFormDto) {
    const result = await this.inventoryService.createInventory(data);
    return new StandardResponse(result, 'Inventory created successfully', 201);
  }
  @Post(CREATE_INVENTORY_ADDRESS)
  async createInventoryAddress(@Body() data: CreateInventoryAddressDto) {
    const result = await this.inventoryService.createInventoryAddress(data);
    return new StandardResponse(
      result,
      'Inventory address created successfully',
      201,
    );
  }
  @Get(GET_ALL_INVENTORY_ADDRESS)
  async getAllInventoryAddress(
    @Query() query: InventoryAdressPageOption,
    @Query('type') type?: InventoryType,
  ) {
    const { inventoryAddresses, count } =
      await this.inventoryService.getAllInventoryAddress(query, type);
    const meta = new PageResponseMetaDto({
      pageOptionsDto: query,
      itemCount: count,
    });
    return new PageResponseDto(inventoryAddresses, meta);
  }
  @Get(GET_ALL)
  async getAllStockInInventory(@Query() query: InventoryAdressPageOption) {
    const { books, count } =
      await this.inventoryService.getAllStockInInventory(query);
    const meta = new PageResponseMetaDto({
      pageOptionsDto: query,
      itemCount: count,
    });
    return new PageResponseDto(books, meta);
  }
  // @Post(UPDATE)
  // async adjustStockInInventory(@Body() data: CreateInventoryFormDto) {
  //   const result = await this.inventoryService.adjustStockInInventory(data);
  //   return new StandardResponse(result, 'Inventory updated successfully');
  // }

}
