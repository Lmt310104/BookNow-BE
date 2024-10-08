import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthorsSerivce {
  constructor(private readonly prisma: PrismaService) {}
  async getAllAuthors() {}
  async createAuthor(body: CreateAuthorDto) {
    const { name, birthday, description } = body;
    const existAuthor = await this.prisma.authors.findFirst({
      where: { name, birthday, description },
    });
    if (existAuthor) {
      throw new BadRequestException('Author already existed');
    }
    const newAuthor = await this.prisma.authors.create({
      data: {
        name,
        birthday,
        description,
      },
    });
    return newAuthor;
  }
  async updateAuthor() {}
  async getAuthorById() {}
}
