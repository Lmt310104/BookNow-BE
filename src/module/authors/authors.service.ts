import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthorPageOptionsDto } from './dto/find-all-author.dto';
import { DEFAULT_AUTHOR_AVATAR, EUploadFolder } from 'src/utils/constants';
import { uploadFilesFromFirebase } from 'src/services/files/upload';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorsSerivce {
  constructor(private readonly prisma: PrismaService) {}
  async getAllAuthors(dto: AuthorPageOptionsDto, key: string) {
    try {
      const condition1 = key?.split(/\s+/).filter(Boolean).join(' & ');
      const authors = await this.prisma.authors.findMany({
        where: {
          ...(condition1 && {
            OR: [
              {
                name: {
                  contains: key,
                  mode: 'insensitive',
                },
              },
              {
                name: {
                  search: condition1,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  search: condition1,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: key,
                  mode: 'insensitive',
                },
              },
              {
                unaccent: {
                  search: condition1,
                  mode: 'insensitive',
                },
              },
            ],
          }),
        },
        skip: dto.skip,
        take: dto.take,
        orderBy: condition1
          ? {
              _relevance: {
                search: condition1,
                fields: ['name', 'description'],
                sort: 'desc',
              },
            }
          : { [dto.sortBy]: dto.order },
      });
      const itemCount = await this.prisma.authors
        .findMany({
          where: {
            ...(condition1 && {
              OR: [
                {
                  name: {
                    contains: key,
                    mode: 'insensitive',
                  },
                },
                {
                  name: {
                    search: condition1,
                    mode: 'insensitive',
                  },
                },
                {
                  description: {
                    search: condition1,
                    mode: 'insensitive',
                  },
                },
                {
                  description: {
                    contains: key,
                    mode: 'insensitive',
                  },
                },
                {
                  unaccent: {
                    search: condition1,
                    mode: 'insensitive',
                  },
                },
              ],
            }),
          },
        })
        .then((res) => res.length);
      return { authors, itemCount };
    } catch (error) {
      throw new BadRequestException(error.messages);
    }
  }
  async createAuthor(body: CreateAuthorDto, avatar: Express.Multer.File) {
    const { name, birthday, description } = body;
    const existAuthor = await this.prisma.authors.findFirst({
      where: { name, birthday: new Date(birthday) },
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
          birthday: new Date(birthday),
          description,
          avatar_url: imageUrls[0] ?? DEFAULT_AUTHOR_AVATAR,
        },
      });
      return newAuthor;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async updateAuthor(dto: UpdateAuthorDto, avatar?: Express.Multer.File) {
    try {
      const { id } = dto;
      const author = await this.prisma.authors.findFirstOrThrow({
        where: { id },
      });
      if (!author) {
        throw new BadRequestException('Author not found');
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
      } catch (error) {
        throw new BadRequestException('Failed to upload images', {
          cause: error,
        });
      }
      const updatedAuthor = await this.prisma.authors.update({
        where: { id },
        data: {
          ...dto,
          avatar_url: imageUrls[0] ?? author.avatar_url,
        },
      });
      return updatedAuthor;
    } catch (error) {
      throw new BadRequestException('Failed to update author', {
        cause: error,
      });
    }
  }
  async getAuthorById(id: string) {
    const author = await this.prisma.authors.findUnique({
      where: { id },
      include: {
        BookAuthor: {
          select: {
            book: true,
          },
        },
      },
    });
    if (!author) {
      throw new BadRequestException('Author not found');
    }
    return author;
  }
  async searchAuthor(query: AuthorPageOptionsDto, key: string) {
    try {
      const condition1 = key?.split(/\s+/).filter(Boolean).join(' & ');
      const authors = await this.prisma.authors.findMany({
        where: {
          OR: [
            {
              name: {
                contains: key,
                mode: 'insensitive',
              },
            },
            {
              name: {
                search: condition1,
                mode: 'insensitive',
              },
            },
            {
              description: {
                search: condition1,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: key,
                mode: 'insensitive',
              },
            },
            {
              unaccent: {
                search: condition1,
                mode: 'insensitive',
              },
            },
          ],
        },
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy]: query.order },
      });
      const itemCount = await this.prisma.authors
        .findMany({
          where: {
            OR: [
              {
                name: {
                  contains: key,
                  mode: 'insensitive',
                },
              },
              {
                name: {
                  search: condition1,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  search: condition1,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: key,
                  mode: 'insensitive',
                },
              },
            ],
          },
        })
        .then((res) => res.length);
      return { authors, itemCount };
    } catch (error) {
      throw new BadRequestException(error.messages);
    }
  }
}
