import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address-dto';
import { UpdateAddressDto } from './dto/update-address-dto';
import { GetAddressDto } from './dto/get-address-dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  TUserSession,
  UserSession,
} from 'src/common/decorators/user-session.decorator';
import {
  CreateListCitiesDto,
  CreateListDistrictsDto,
} from './dto/create-city-dto';

@ApiTags('Address V2')
@Controller('v2/address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new address' })
  createAddress(
    @UserSession() user: TUserSession,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.addressService.createAddress(user.id, createAddressDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all addresses for the current user' })
  getAllAddressByUser(
    @UserSession() user: TUserSession,
    @Query() query: GetAddressDto,
  ) {
    return this.addressService.getAllAddressByUser(user.id, query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get address by ID' })
  getAddressById(@Param('id') id: string) {
    return this.addressService.getAddressById(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an address' })
  updateAddress(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressService.updateAddress(id, updateAddressDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an address' })
  deleteAddress(@Param('id') id: string) {
    return this.addressService.deleteAddress(id);
  }

  @Post('/cities')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create list of cities' })
  async createCityList(@Body() body: CreateListCitiesDto) {
    return this.addressService.createListCities(body);
  }
  @Post('/cities/:city_id/districts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create list of districts' })
  async createWardList(
    @Param('city_id') city_id: string,
    @Body() body: CreateListDistrictsDto,
  ) {
    return this.addressService.createListDistricts(city_id, body);
  }
}
