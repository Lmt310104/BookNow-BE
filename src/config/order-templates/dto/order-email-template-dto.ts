import { PAYMENT_METHOD } from 'src/utils/constants';
import { OrderItemTemplateDto } from './order-item-template-dto';

export class OrderEmailTemplateDto {
  id: string;
  total_price: number;
  full_name: string;
  phone_number: string;
  address: string;
  pending_at: Date;
  processing_at: Date | null;
  delivered_at: Date | null;
  cancelled_at: Date | null;
  success_at: Date | null;
  reject_at: Date | null;
  created_at: Date;
  payment_method: PAYMENT_METHOD;
  OrderItems: OrderItemTemplateDto[];
}
