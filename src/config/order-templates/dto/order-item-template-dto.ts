import { BookTemplateDto } from './book-template-dto';

export class OrderItemTemplateDto {
  id: string;
  order_id: string;
  quantity: number;
  price: number;
  Book: BookTemplateDto;
}
