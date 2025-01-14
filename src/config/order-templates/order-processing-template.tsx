import { Body, Head, Html, Preview } from '@react-email/components';
import { OrderEmailTemplateDto } from './dto/order-email-template-dto';

interface OrderSuccessProps {
  order: OrderEmailTemplateDto;
  userName: string;
}

export const OrderProcessing = ({ order, userName }: OrderSuccessProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        The sales intelligence platform that helps you uncover qualified leads.
      </Preview>
      <Body style={main}>
        <h1 style={title}>BOOKNOW - Đơn hàng đang được xử lý</h1>
        <p style={paragraph}>Xin chào {userName},</p>
        <p style={paragraph}>
          BookNow xin chân thành cảm ơn bạn vì đã mua hàng. Đơn đặt hàng của bạn
          đã được thanh toán và đang được xử lý vào ngày{' '}
          {order.processing_at.toLocaleDateString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
          . Dưới đây là chi tiết đơn hàng của bạn:
        </p>
        <p style={paragraph}>
          <strong>Mã đơn hàng:</strong> {order.id}
        </p>
        <p style={paragraph}>
          <strong>Ngày đặt hàng:</strong>{' '}
          {order.created_at.toLocaleDateString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </p>
        <p style={paragraph}>
          <strong>Tổng giá trị đơn hàng:</strong>{' '}
          {order.total_price.toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
          })}
        </p>
        <p style={paragraph}>
          <strong>Phương thức thanh toán:</strong>{' '}
          {order.payment_method === 'COD'
            ? 'Thanh toán khi nhận hàng'
            : order.payment_method}
        </p>
        <p style={paragraph}>
          <strong>Thông tin người nhân hàng:</strong>{' '}
          {order.full_name + ' - SĐT: ' + order.phone_number}
        </p>
        <p style={paragraph}>
          <strong>Địa chỉ nhận hàng:</strong> {order.address}
        </p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Ảnh sản phẩm</th>
              <th style={tableHeaderStyle}>Tên sách</th>
              <th style={tableHeaderStyle}>Số Lượng</th>
              <th style={tableHeaderStyle}>Giá</th>
            </tr>
          </thead>
          <tbody>
            {order.OrderItems.map((orderItem) => (
              <tr key={orderItem.Book.id}>
                <td style={tableCellStyle}>
                  <img
                    src={orderItem.Book.image_url[0]}
                    alt="Product Image"
                    style={imageStyle}
                  />
                </td>
                <td style={tableCellStyle}>
                  {orderItem.Book.title} - {orderItem.Book.author}
                </td>
                <td style={tableCellStyle}>{orderItem.quantity}</td>
                <td style={tableCellStyle}>{orderItem.price} VND</td>
              </tr>
            ))}
          </tbody>
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

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  marginTop: '20px',
};

const tableHeaderStyle = {
  textAlign: 'left' as const,
  padding: '10px',
  borderBottom: '2px solid #ddd',
  fontWeight: 'bold',
};

const tableCellStyle = {
  padding: '10px',
  borderBottom: '1px solid #ddd',
};

const imageStyle = {
  maxWidth: '100px',
  height: 'auto',
  borderRadius: '8px',
  display: 'block',
  margin: '0 auto',
};
