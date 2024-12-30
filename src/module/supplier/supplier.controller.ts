import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { SuppliersService } from './supplier.service';
import { END_POINTS } from 'src/utils/constants';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { SupplierPageOptionsDto } from './dto/get-all-supplier.dto';
import { PageResponseDto } from 'src/utils/page-response.dto';
import { PageResponseMetaDto } from 'src/utils/page-response-meta.dto';
import { StandardResponse } from 'src/utils/response.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PageOptionsDto } from 'src/utils/page-options-dto';

const {
  SUPPLIERS: {
    BASE,
    GET_ALL,
    CREATE,
    UPDATE,
    GET_ONE,
    ACTIVE,
    INACTIVE,
    SEARCH,
  },
} = END_POINTS;
@Controller(BASE)
export class SuppliersController {
  constructor(private readonly supplierService: SuppliersService) {}
  @Post(CREATE)
  async createSupplier(@Body() dto: CreateSupplierDto) {
    const result = await this.supplierService.createSupplier(dto);
    return new StandardResponse(result, 'Supplier created successfully', 201);
  }
  @Put(UPDATE)
  async updateSupplier(@Body() dto: UpdateSupplierDto) {
    const result = await this.supplierService.updateSupplier(dto);
    return new StandardResponse(result, 'Supplier updated successfully', 200);
  }
  @Get(GET_ALL)
  async getAllSuppliers(
    @Query() query: SupplierPageOptionsDto,
    @Query('active', ParseBoolPipe) active: boolean,
  ) {
    const { suppliers, itemCount } = await this.supplierService.getAllSuppliers(
      query,
      active,
    );
    const meta = new PageResponseMetaDto({
      pageOptionsDto: query,
      itemCount,
    });
    return new PageResponseDto(suppliers, meta);
  }
  @Get(GET_ONE)
  async getOneSupplier(@Param('id', ParseUUIDPipe) id: string) {
    const supplier = await this.supplierService.getOneSupplier(id);
    return new StandardResponse(supplier, 'Supplier found successfully', 200);
  }
  @Post(ACTIVE)
  async activeSupplier(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.supplierService.activeSupplier(id);
    return new StandardResponse(result, 'Supplier activated successfully', 200);
  }
  @Post(INACTIVE)
  async inactiveSupplier(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.supplierService.inactiveSupplier(id);
    return new StandardResponse(
      result,
      'Supplier inactivated successfully',
      200,
    );
  }
  @Get(SEARCH)
  async searchSupplier(
    @Query() query: PageOptionsDto,
    @Query('active', ParseBoolPipe) active: boolean,
    @Query('keyword') keyword: string,
  ) {
    const { suppliers, itemCount } = await this.supplierService.searchSupplier(
      query,
      active,
      keyword,
    );
    const meta = new PageResponseMetaDto({
      pageOptionsDto: query,
      itemCount,
    });
    return new PageResponseDto(suppliers, meta);
  }
}
