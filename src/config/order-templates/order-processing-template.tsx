import { Body, Head, Html, Preview } from '@react-email/components';
import { OrderEmailTemplateDto } from './dto/order-email-template-dto';

interface OrderProcessingProps {
  order: OrderEmailTemplateDto;
  userName: string;
}

export const OrderProcessing = ({ order, userName }: OrderProcessingProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        The sales intelligence platform that helps you uncover qualified leads.
      </Preview>
      <Body style={main}>
        <h1 style={title}>Order Processing</h1>
        <p style={paragraph}>Hi {userName},</p>
        <p style={paragraph}>
          Your order has been processing at {order.processing_at.toDateString()}
          . Here are the details:
        </p>
        <p style={paragraph}>
          <strong>Order ID:</strong> {order.id}
        </p>
        <p style={paragraph}>
          <strong>Order Date:</strong> {order.created_at.toTimeString()}
        </p>
        <p style={paragraph}>
          <strong>Order Total:</strong> {order.total_price.toString()} VND
        </p>
        <p style={paragraph}>
          <strong>Payment Method:</strong> {order.payment_method}
        </p>
        <p style={paragraph}>
          <strong>Shipping Address:</strong> {order.address}
        </p>
        <table>
          <tr>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
          {order.OrderItems.map((orderItem) => (
            <tr>
              <td>
                {orderItem.Book.title} - {orderItem.Book.author}{' '}
              </td>
              <td>{orderItem.quantity}</td>
              <td>{orderItem.price} VND</td>
            </tr>
          ))}
        </table>
      </Body>
    </Html>
  );
};

const main = {
  fontFamily: 'Arial, sans-serif',
  padding: '20px',
};

const title = {
  color: '#47699d',
  fontSize: '24px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.5',
};
