import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}
  async create(body: CreateCategoryDto) {
    const { name } = body;
    const existCategory = await this.prisma.category.findFirst({
      where: { name },
    });
    if (existCategory) {
      throw new BadRequestException('Category already existed');
    }
    const newCategory = await this.prisma.category.create({
      data: {
        name: name,
      },
    });
    return newCategory;
  }
  async update() {}
  async getAll() {
    const categories = await this.prisma.category.findMany();
    return categories;
  }
}
