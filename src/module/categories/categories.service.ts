import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { PageOptionsDto } from 'src/utils/page-options-dto';

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
  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: id },
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    await this.prisma.category.update({
      where: { id: id },
      data: dto?.name ? dto.name : category.name,
    });
    return category;
  }
  async getAll(query: PageOptionsDto) {
    const categories = await this.prisma.category.findMany({
      where: { is_disable: false },
      skip: query.skip,
      take: query.take,
      orderBy: { [query.sortBy]: query.order },
    });
    const itemCount = await this.prisma.category.count();
    return { categories, itemCount };
  }
  async disableCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: id },
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    await this.prisma.category.update({
      where: { id: id },
      data: { is_disable: true },
    });
    return category;
  }
  async enable(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: id },
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    await this.prisma.category.update({
      where: { id: id },
      data: { is_disable: false },
    });
    return category;
  }
}
