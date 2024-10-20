import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetReviewsDto } from './dto/find-all-rating-reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}
  async getAllReviews(dto: GetReviewsDto) {
    const { take, skip } = dto;
    const data = await this.prisma.reviews.findMany({
      skip: skip,
      take: take,
    });
    return data;
  }
  async getReviewDetails(id: number) {
    const reviewDetail = await this.prisma.reviews.findUnique({
      where: {
        id: id,
      },
    });
    return reviewDetail;
  }
}
