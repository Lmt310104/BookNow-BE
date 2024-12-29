import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthorPageOptionsDto } from './dto/find-all-author.dto';
import { DEFAULT_AUTHOR_AVATAR, EUploadFolder } from 'src/utils/constants';
import { uploadFilesFromFirebase } from 'src/services/files/upload';

@Injectable()
export class AuthorsSerivce {
  constructor(private readonly prisma: PrismaService) {}
  async getAllAuthors(dto: AuthorPageOptionsDto) {
    const { take, skip, order, sortBy } = dto;
    const authors = await this.prisma.authors.findMany({
      skip: skip,
      take: take,
      orderBy: { [sortBy]: order },
    });
    return authors;
  }
  async createAuthor(body: CreateAuthorDto, avatar: Express.Multer.File) {
    const { name, birthday, description } = body;
    const existAuthor = await this.prisma.authors.findFirst({
      where: { name, birthday, description },
    });
    if (existAuthor) {
      throw new BadRequestException('Author already existed');
    }
    let imageUrls = [];
    try {
      if (avatar && avatar.buffer.byteLength > 0) {
        const uploadImagesData = await uploadFilesFromFirebase(
          [avatar],
          EUploadFolder.author,
        );
        if (!uploadImagesData.success) {
          throw new Error('Failed to upload images!');
        }
        imageUrls = uploadImagesData.urls;
      }
      const newAuthor = await this.prisma.authors.create({
        data: {
          name,
          birthday,
          description,
          avatar_url: imageUrls[0] ?? DEFAULT_AUTHOR_AVATAR,
        },
      });
      return newAuthor;
    } catch (error) {
      throw new BadRequestException('Failed to upload images', {
        cause: error,
      });
    }
  }
  async updateAuthor() {}
  async getAuthorById(id: string) {
    const author = await this.prisma.authors.findUnique({
      where: { id },
    });
    if (!author) {
      throw new BadRequestException('Author not found');
    }
    return author;
  }
}
