import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DOCUMENTATION, END_POINTS } from 'src/utils/constants';
import { PromotionService } from './promotion.service';
import { FindAllPromotionDto } from './dto/find-all-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  CreateNormalPromotionDto,
  CreatePromotionComboDto,
  CreatePromotionShockDealDto,
} from './dto/create-promotion.dto';

const {
  PROMOTION: {
    BASE,
    GET_ALL,
    CREATE_NORMAL,
    CREATE_COMBO,
    CREATE_SHOCK_DEAL,
    UPDATE,
    GET_ONE,
  },
} = END_POINTS;

@ApiTags(DOCUMENTATION.TAGS.PROMOTION)
@Controller(BASE)
@UseInterceptors(CacheInterceptor)
export class PromotionController {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly promotionService: PromotionService,
  ) {}

  @ApiOperation({
    description: 'Create new combo promotion',
  })
  @Post(CREATE_COMBO)
  async createNewPromotionCombo(dto: CreatePromotionComboDto) {
    return await this.promotionService.CreateNewPromotionCombo(dto);
  }

  @ApiOperation({
    description: 'Create new normal promotion',
  })
  @Post(CREATE_NORMAL)
  async createNewNormalPromotion(dto: CreateNormalPromotionDto) {
    return await this.promotionService.CreateNewNormalPromotion(dto);
  }

  @ApiOperation({
    description: 'Create new shock deal promotion',
  })
  @Post(CREATE_SHOCK_DEAL)
  async createNewPromotionSockDeal(dto: CreatePromotionShockDealDto) {
    return await this.promotionService.CreateNewPromotionShockDeal(dto);
  }

  @ApiOperation({
    summary: 'Update existing promotion campaign',
  })
  @Patch(UPDATE)
  async updatePromotion(
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
  ) {
    return await this.promotionService.updatePromotion(id, dto);
  }

  @ApiOperation({
    summary: 'Get all promotion campaigns in current system',
  })
  @Get(GET_ALL)
  async getAllPromotions(@Query() query: FindAllPromotionDto) {
    return await this.promotionService.getAllPromotions(query);
  }

  @Get(GET_ONE)
  @ApiOperation({
    summary: 'Get promotion details by id',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: '4d4fea76-8bbb-48db-a30c-5dc51085b654',
        name: 'Promotion update 2',
        start_date: '2025-03-02T17:00:00.000Z',
        end_date: '2025-03-29T17:00:00.000Z',
        order_limit: 10,
        discount_value: 20000,
        max_usage_per_user: 10,
        type: 'SHOP_DISCOUNT',
        discount_type: 'FIXED',
        create_at: '2025-03-04T03:01:20.376Z',
        update_at: '2025-03-04T03:42:53.229Z',
        PromotionBook: [
          {
            id: 'f6d0a004-ad19-4850-92f9-2a6755d10285',
            promotion_id: '4d4fea76-8bbb-48db-a30c-5dc51085b654',
            book_id: '0e723bd6-8c68-4477-be17-5233c8e7b63a',
            book: {
              id: '0e723bd6-8c68-4477-be17-5233c8e7b63a',
              title: 'Đánh Thức Con Người Phi Thường Trong Bạn',
              author: 'Anthony Robbins ',
              category_id: 'f5972dbb-6acb-4f8e-a2d2-6d807e486d87',
              price: '125000',
              stock_quantity: 45,
              description:
                'Để Đánh Thức Con Người Phi Thường Trong Bạn, Anthony Robbins đã nghiên cứu và chia sẻ 3 nguyên tắc nền tảng tạo ra sự thay đổi bền vững. Đó là: Nâng tầm bản thân, Thay đổi niềm tin hạn hẹp về bản thân, Thay đổi chiến lược.\r\n\r\nÔng cũng chia kỹ năng cuộc sống ra làm 5 khía cạnh để người đọc có thể dễ dàng cải thiện và phát triển: Làm chủ cảm xúc, Làm chủ cơ thể, Tạo dựng và duy trì mối quan hệ, Quản lý tài chính, Làm chủ thời gian.\r\n\r\nQua cuốn Đánh Thức Con Người Phi Thường Trong Bạn, người đọc có thể phát hiện ra những lý do khiến mình tiếp tục hành động theo thói cũ và tác nhân gây ra những cảm xúc mà bạn thường gặp nhất. Đồng thời, tìm thấy một lộ trình để từng bước xác định cảm xúc nào củng cố thêm sức mạnh, cảm xúc nào triệt tiêu động lực tinh thần. Khi đó, xúc cảm không còn là chướng ngại, mà thay vào đó trở thành công cụ đắc lực hỗ trợ người đọc phát huy tối đa tiềm năng của mình. Làm được điều này, tất nhiên, “gã khổng lồ” trong mỗi con người nhất định sẽ được đánh thức.\r\n\r\nPeter Guber, cựu Chủ tịch Hội đồng Quản trị S Pictures Entertainment nhận xét: “Cuốn sách là một công cụ mạnh mẽ và có ý nghĩa sâu sắc giúp chuyển hóa nhận thức bản thân. Đây là nguồn sức mạnh, nguồn cảm hứng khơi dậy những hiểu biết thấu suốt bên trong, không chỉ hữu ích với việc phát triển bản thân mà còn cho cả nghề nghiệp chuyên môn”.\r\n\r\nDù đã ra đời từ rất lâu trước đây nhưng cuốn sách Đánh Thức Con Người Phi Thường Trong Bạn vẫn luôn nằm trong danh sách sách bán chạy nhất. Không đao to búa lớn, không có những lập luận khô khan, cuốn sách của Anthony Robbins chia sẻ các phương pháp làm chủ cảm xúc, cơ thể, mối quan hệ, tài chính qua những câu chuyện bình dị, những câu danh ngôn khích lệ nhưng xác đáng, thuyết phục. Ấn bản tiếng Việt của First News được người dịch chăm chút chuyển tải để độc giả dễ đọc dễ hiểu. Bên cạnh bản bìa mềm, sách có thêm phiên bản bìa cứng mới sang trọng, mang lại một trải nghiệm đọc sách rất khác, có giá trị lưu trữ cao, rất phù hợp với những người yêu mến Anthony Robbins và muốn sưu tầm sách của ông.',
              entry_price: '110000',
              final_price: null,
              discountPercentage: null,
              discountDate: null,
              avg_stars: '0',
              total_reviews: 0,
              sold_quantity: 2,
              image_url: [
                'https://firebasestorage.googleapis.com/v0/b/booknow-22cff.appspot.com/o/book%2F1737014636169-a6013b4a29f7b30a434c9242946eb429.jpg.webp?alt=media',
              ],
              status: 'ACTIVE',
              created_at: '2025-01-16T08:03:58.670Z',
              updated_at: '2025-01-17T08:38:26.078Z',
              unaccent:
                'Danh Thuc Con Nguoi Phi Thuong Trong Ban De Danh Thuc Con Nguoi Phi Thuong Trong Ban, Anthony Robbins da nghien cuu va chia se 3 nguyen tac nen tang tao ra su thay doi ben vung. Do la: Nang tam ban than, Thay doi niem tin han hep ve ban than, Thay doi chien luoc.\r\n\r\nOng cung chia ky nang cuoc song ra lam 5 khia canh de nguoi doc co the de dang cai thien va phat trien: Lam chu cam xuc, Lam chu co the, Tao dung va duy tri moi quan he, Quan ly tai chinh, Lam chu thoi gian.\r\n\r\nQua cuon Danh Thuc Con Nguoi Phi Thuong Trong Ban, nguoi doc co the phat hien ra nhung ly do khien minh tiep tuc hanh dong theo thoi cu va tac nhan gay ra nhung cam xuc ma ban thuong gap nhat. Dong thoi, tim thay mot lo trinh de tung buoc xac dinh cam xuc nao cung co them suc manh, cam xuc nao triet tieu dong luc tinh than. Khi do, xuc cam khong con la chuong ngai, ma thay vao do tro thanh cong cu dac luc ho tro nguoi doc phat huy toi da tiem nang cua minh. Lam duoc dieu nay, tat nhien, "ga khong lo" trong moi con nguoi nhat dinh se duoc danh thuc.\r\n\r\nPeter Guber, cuu Chu tich Hoi dong Quan tri S Pictures Entertainment nhan xet: "Cuon sach la mot cong cu manh me va co y nghia sau sac giup chuyen hoa nhan thuc ban than. Day la nguon suc manh, nguon cam hung khoi day nhung hieu biet thau suot ben trong, khong chi huu ich voi viec phat trien ban than ma con cho ca nghe nghiep chuyen mon".\r\n\r\nDu da ra doi tu rat lau truoc day nhung cuon sach Danh Thuc Con Nguoi Phi Thuong Trong Ban van luon nam trong danh sach sach ban chay nhat. Khong dao to bua lon, khong co nhung lap luan kho khan, cuon sach cua Anthony Robbins chia se cac phuong phap lam chu cam xuc, co the, moi quan he, tai chinh qua nhung cau chuyen binh di, nhung cau danh ngon khich le nhung xac dang, thuyet phuc. An ban tieng Viet cua First News duoc nguoi dich cham chut chuyen tai de doc gia de doc de hieu. Ben canh ban bia mem, sach co them phien ban bia cung moi sang trong, mang lai mot trai nghiem doc sach rat khac, co gia tri luu tru cao, rat phu hop voi nhung nguoi yeu men Anthony Robbins va muon suu tam sach cua ong. Anthony Robbins ',
              supplier_id: '13b5c0ad-3740-4929-831e-ed9e12243ddc',
              sku: 'BN002',
            },
          },
        ],
      },
    },
  })
  async getOnePromotion(@Param('id') id: string) {
    return await this.promotionService.getOnePromotion(id);
  }
}
