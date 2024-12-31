import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import HttpStatusCode from 'src/utils/HttpStatusCode';
import { SupplierPageOptionsDto } from './dto/get-all-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PageOptionsDto } from 'src/utils/page-options-dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}
  async createSupplier(dto: CreateSupplierDto) {
    try {
      const { name, address, email, phone } = dto;
      const existSupplier = await this.prisma.supplier.findFirst({
        where: { name },
      });
      if (existSupplier) {
        throw new HttpException(
          'Supplier already exists',
          HttpStatusCode.BAD_REQUEST,
        );
      }
      const newSupplier = await this.prisma.supplier.create({
        data: {
          name,
          address,
          email,
          phone,
        },
      });
      return newSupplier;
    } catch (error) {
      throw new HttpException(error.message, HttpStatusCode.BAD_REQUEST);
    }
  }
  async getAllSuppliers(query: SupplierPageOptionsDto, active: boolean) {
    try {
      const where = active !== undefined ? { active: active } : {};
      const [suppliers, itemCount] = await Promise.all([
        this.prisma.supplier.findMany({
          where,
          skip: query.skip,
          take: query.take,
          orderBy: {
            [query.sortBy]: query.order,
          },
        }),
        this.prisma.supplier.count({ where }),
      ]);
      return { suppliers, itemCount };
    } catch (error) {
      throw new HttpException(error.message, HttpStatusCode.BAD_REQUEST);
    }
  }
  async getOneSupplier(id: string) {
    try {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id },
      });
      return supplier;
    } catch (error) {
      throw new HttpException(error.message, HttpStatusCode.BAD_REQUEST);
    }
  }
  async updateSupplier(dto: UpdateSupplierDto) {
    try {
      const { id } = dto;
      const supplier = await this.prisma.supplier.findUnique({
        where: { id },
      });
      if (!supplier) {
        throw new HttpException('Supplier not found', HttpStatusCode.NOT_FOUND);
      }
      const updatedSupplier = await this.prisma.supplier.update({
        where: { id },
        data: {
          ...dto,
        },
      });
      return updatedSupplier;
    } catch (error) {
      throw new HttpException(error.message, HttpStatusCode.BAD_REQUEST);
    }
  }
  async activeSupplier(id: string) {
    try {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id },
      });
      if (!supplier) {
        throw new HttpException('Supplier not found', HttpStatusCode.NOT_FOUND);
      }
      const updatedSupplier = await this.prisma.supplier.update({
        where: { id },
        data: {
          active: true,
        },
      });
      return updatedSupplier;
    } catch (error) {
      throw new HttpException(error.message, HttpStatusCode.BAD_REQUEST);
    }
  }
  async inactiveSupplier(id: string) {
    try {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id },
      });
      if (!supplier) {
        throw new HttpException('Supplier not found', HttpStatusCode.NOT_FOUND);
      }
      const updatedSupplier = await this.prisma.supplier.update({
        where: { id },
        data: {
          active: false,
        },
      });
      return updatedSupplier;
    } catch (error) {
      throw new HttpException(error.message, HttpStatusCode.BAD_REQUEST);
    }
  }
  async searchSupplier(query: PageOptionsDto, active: boolean, key: string) {
    try {
      const condition = key?.split(/\s+/).filter(Boolean).join(' & ');
      const where = active !== undefined ? { active: active } : {};
      const suppliers = await this.prisma.supplier.findMany({
        where: {
          ...where,
          OR: [
            {
              name: {
                contains: key,
                mode: 'insensitive',
              },
            },
            {
              name: {
                search: condition,
                mode: 'insensitive',
              },
            },
            {
              address: {
                contains: key,
                mode: 'insensitive',
              },
            },
            {
              address: {
                search: condition,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: key,
                mode: 'insensitive',
              },
            },
            {
              email: {
                search: condition,
                mode: 'insensitive',
              },
            },
            {
              phone: {
                contains: key,
                mode: 'insensitive',
              },
            },
            {
              phone: {
                search: condition,
                mode: 'insensitive',
              },
            },
          ],
        },
        take: query.take,
        skip: query.skip,
        orderBy: key
          ? {
              _relevance: {
                fields: ['name', 'address', 'email', 'phone'],
                search: condition,
                sort: 'desc',
              },
            }
          : { [query.sortBy]: query.order },
      });
      const itemCount = await this.prisma.supplier
        .findMany({
          where: {
            ...where,
            OR: [
              {
                name: {
                  contains: key,
                  mode: 'insensitive',
                },
              },
              {
                name: {
                  search: condition,
                  mode: 'insensitive',
                },
              },
              {
                address: {
                  contains: key,
                  mode: 'insensitive',
                },
              },
              {
                address: {
                  search: condition,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: key,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  search: condition,
                  mode: 'insensitive',
                },
              },
              {
                phone: {
                  contains: key,
                  mode: 'insensitive',
                },
              },
              {
                phone: {
                  search: condition,
                  mode: 'insensitive',
                },
              },
            ],
          },
        })
        .then((data) => data.length);
      return { suppliers, itemCount };
    } catch (error) {
      throw new HttpException(error.message, HttpStatusCode.BAD_REQUEST);
    }
  }
}
