import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@module/prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address-dto';
import { UpdateAddressDto } from './dto/update-address-dto';
import { GetAddressDto } from './dto/get-address-dto';
import { StandardResponse } from 'src/utils/response.dto';
import {
  CreateListCitiesDto,
  CreateListDistrictsDto,
} from './dto/create-city-dto';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}

  async createAddress(userId: string, dto: CreateAddressDto) {
    await this.prisma.districts.findUniqueOrThrow({
      where: { id: dto.district_id },
    });
    const address = await this.prisma.newAddress.create({
      data: {
        user_id: userId,
        full_name: dto.full_name,
        phone_number: dto.phone_number,
        street: dto.street,
        district_id: dto.district_id,
        ward_name: dto.ward_name ?? null,
        lat: dto.lat,
        lon: dto.lon,
      },
    });
    return new StandardResponse(address, 'Address created successfully', 201);
  }

  async getAllAddressByUser(userId: string, query: GetAddressDto) {
    const addresses = await this.prisma.newAddress.findMany({
      where: {
        user_id: userId,
      },
      skip: query.skip,
      take: query.take,
      orderBy: {
        created_at: 'desc',
      },
    });

    const count = await this.prisma.newAddress.count({
      where: {
        user_id: userId,
      },
    });

    return new StandardResponse(
      { addresses, count },
      'User addresses retrieved successfully',
      200,
    );
  }

  async getAddressById(id: string) {
    const address = await this.prisma.newAddress.findUnique({
      where: {
        id,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return new StandardResponse(address, 'Address retrieved successfully', 200);
  }

  async updateAddress(id: string, dto: UpdateAddressDto) {
    const address = await this.prisma.newAddress.findUnique({
      where: {
        id,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }
    await this.prisma.districts.findUniqueOrThrow({
      where: { id: dto.district_id },
    });
    const updatedAddress = await this.prisma.newAddress.update({
      where: {
        id,
      },
      data: {
        full_name: dto.full_name ?? address.full_name,
        phone_number: dto.phone_number ?? address.phone_number,
        street: dto.street ?? address.street,
        district_id: dto.district_id ?? address.district_id,
        ward_name: dto.ward_name ?? address.ward_name,
        lat: dto.lat ?? address.lat,
        lon: dto.lon ?? address.lon,
      },
    });

    return new StandardResponse(
      updatedAddress,
      'Address updated successfully',
      200,
    );
  }

  async deleteAddress(id: string) {
    const address = await this.prisma.newAddress.findUnique({
      where: {
        id,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.prisma.newAddress.delete({
      where: {
        id,
      },
    });

    return new StandardResponse(null, 'Address deleted successfully', 200);
  }

  async createListCities(body: CreateListCitiesDto) {
    const cities = body.cities.map((city) => ({
      id: city.id,
      name: city.name,
      postal_code: city.postal_code,
    }));
    const createdCities = await this.prisma.cities.createMany({
      data: cities,
      skipDuplicates: true,
    });
    return new StandardResponse(
      createdCities,
      'Cities created successfully',
      201,
    );
  }

  async createListDistricts(city_id: string, body: CreateListDistrictsDto) {
    const districts = body.districts.map((district) => ({
      id: district.id,
      name: district.name,
      city_id: city_id,
      district_code: district.district_code,
    }));
    const createdDistricts = await this.prisma.districts.createMany({
      data: districts,
      skipDuplicates: true,
    });
    return new StandardResponse(
      createdDistricts,
      'Districts created successfully',
      201,
    );
  }
}
