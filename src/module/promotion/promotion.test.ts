import { Test, TestingModule } from '@nestjs/testing';
import { PromotionService } from './promotion.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BookStatus, PromotionCategory, PromotionStatus } from '@prisma/client';
import { CreatePromotionComboDto } from './dto/create-promotion.dto';
import { StandardResponse } from 'src/utils/response.dto';

describe('PromotionService - CreateNewPromotionCombo', () => {
  let service: PromotionService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    books: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
    promotion: {
      create: jest.fn(),
    },
    promotionCombo: {
      create: jest.fn(),
    },
    promotionComboProduct: {
      createMany: jest.fn(),
    },
    promotionComboCondition: {
      createMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PromotionService>(PromotionService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('CreateNewPromotionCombo', () => {
    const validBookId1 = 'book-id-1';
    const validBookId2 = 'book-id-2';

    const mockBooks = [
      { id: validBookId1, status: BookStatus.ACTIVE, title: 'Book 1' },
      { id: validBookId2, status: BookStatus.ACTIVE, title: 'Book 2' },
    ];

    const createPromotionComboDto: CreatePromotionComboDto = {
      name: 'Test Combo Promotion',
      start_date: new Date('2023-01-01'),
      end_date: new Date('2023-12-31'),
      book_ids: [validBookId1, validBookId2],
      type: 'BUY_X_GET_Y' as any,
      max_usage_per_user: 3,
      eligibilities: [
        { quantity: 2, discount_value: 5 },
        { quantity: 3, discount_value: 10 },
      ],
    };

    it('should successfully create a combo promotion', async () => {
      // Arrange
      const promotionId = 'promo-id-123';
      const comboId = 'combo-id-123';

      mockPrismaService.books.findMany.mockResolvedValue(mockBooks);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        mockPrismaService.promotion.create.mockResolvedValue({
          id: promotionId,
        });
        mockPrismaService.promotionCombo.create.mockResolvedValue({
          id: comboId,
        });
        mockPrismaService.promotionComboProduct.createMany.mockResolvedValue(
          {},
        );
        mockPrismaService.promotionComboCondition.createMany.mockResolvedValue(
          {},
        );

        return await callback(mockPrismaService);
      });

      // Act
      const result = await service.CreateNewPromotionCombo(
        createPromotionComboDto,
      );

      // Assert
      expect(mockPrismaService.books.findMany).toHaveBeenCalledWith({
        where: { id: { in: createPromotionComboDto.book_ids } },
        select: { id: true, status: true, title: true },
      });

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockPrismaService.promotion.create).toHaveBeenCalledWith({
        data: {
          name: createPromotionComboDto.name,
          start_date: createPromotionComboDto.start_date,
          end_date: createPromotionComboDto.end_date,
          max_usage_per_user: createPromotionComboDto.max_usage_per_user,
          promotion_category: PromotionCategory.COMBO_DISCOUNT,
          status: PromotionStatus.UPCOMING,
        },
      });

      expect(mockPrismaService.promotionCombo.create).toHaveBeenCalledWith({
        data: {
          promotion_id: promotionId,
          promotion_combo_type: createPromotionComboDto.type,
        },
      });

      expect(
        mockPrismaService.promotionComboProduct.createMany,
      ).toHaveBeenCalledWith({
        data: createPromotionComboDto.book_ids.map((bookId) => ({
          promotion_combo_id: comboId,
          book_id: bookId,
        })),
      });

      expect(
        mockPrismaService.promotionComboCondition.createMany,
      ).toHaveBeenCalledWith({
        data: createPromotionComboDto.eligibilities.map((eligibility) => ({
          promotion_combo_id: comboId,
          quantity: eligibility.quantity,
          discount_value: eligibility.discount_value,
        })),
      });

      expect(result).toBeInstanceOf(StandardResponse);
      expect(result.data).toEqual({ promotionId });
      expect(result.message).toBe('Combo promotion created successfully');
      expect(result.statusCode).toBe(201);
    });

    it('should throw BadRequestException when start date is after end date', async () => {
      // Arrange
      const invalidDto = {
        ...createPromotionComboDto,
        start_date: new Date('2023-12-31'),
        end_date: new Date('2023-01-01'),
      };

      // Act & Assert
      await expect(service.CreateNewPromotionCombo(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.books.findMany).not.toHaveBeenCalled();
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when book_ids is empty', async () => {
      // Arrange
      const invalidDto = {
        ...createPromotionComboDto,
        book_ids: [],
      };

      // Act & Assert
      await expect(service.CreateNewPromotionCombo(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when books are not found', async () => {
      // Arrange
      mockPrismaService.books.findMany.mockResolvedValue([mockBooks[0]]); // Return only one book

      // Act & Assert
      await expect(
        service.CreateNewPromotionCombo(createPromotionComboDto),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when books are not active', async () => {
      // Arrange
      const inactiveBooks = [
        { ...mockBooks[0], status: BookStatus.INACTIVE },
        { ...mockBooks[1] },
      ];
      mockPrismaService.books.findMany.mockResolvedValue(inactiveBooks);

      // Act & Assert
      await expect(
        service.CreateNewPromotionCombo(createPromotionComboDto),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should create promotion without eligibilities when none are provided', async () => {
      // Arrange
      const dtoWithoutEligibilities = {
        ...createPromotionComboDto,
        eligibilities: undefined,
      };

      const promotionId = 'promo-id-123';
      const comboId = 'combo-id-123';

      mockPrismaService.books.findMany.mockResolvedValue(mockBooks);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        mockPrismaService.promotion.create.mockResolvedValue({
          id: promotionId,
        });
        mockPrismaService.promotionCombo.create.mockResolvedValue({
          id: comboId,
        });
        mockPrismaService.promotionComboProduct.createMany.mockResolvedValue(
          {},
        );

        return await callback(mockPrismaService);
      });

      // Act
      const result = await service.CreateNewPromotionCombo(
        dtoWithoutEligibilities,
      );

      // Assert
      expect(
        mockPrismaService.promotionComboCondition.createMany,
      ).not.toHaveBeenCalled();
      expect(result).toBeInstanceOf(StandardResponse);
    });

    it('should propagate transaction errors', async () => {
      // Arrange
      mockPrismaService.books.findMany.mockResolvedValue(mockBooks);
      mockPrismaService.$transaction.mockRejectedValue(
        new Error('Transaction failed'),
      );

      // Act & Assert
      await expect(
        service.CreateNewPromotionCombo(createPromotionComboDto),
      ).rejects.toThrow('Server error');
    });
  });
});
