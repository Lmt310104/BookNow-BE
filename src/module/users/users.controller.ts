import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DOCUMENTATION, END_POINTS } from 'src/utils/constants';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import {
  TUserSession,
  UserSession,
} from 'src/common/decorators/user-session.decorator';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { GetAllUserDto } from './dto/get-all-user.dto';
import { PageResponseMetaDto } from 'src/utils/page-response-meta.dto';
import { PageResponseDto } from 'src/utils/page-response.dto';

const {
  USERS: { BASE, GET_ALL, CREATE, GET_ONE, UPDATE, ENABLE, DISABLE },
} = END_POINTS;

@ApiTags(DOCUMENTATION.TAGS.USERS)
@Controller(BASE)
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @Get(GET_ALL)
  async getAllUsers(@Query() query: GetAllUserDto) {
    const users = await this.userService.getAllUsers(query);
    const meta = new PageResponseMetaDto({
      pageOptionsDto: query,
      itemCount: users.length,
    });
    return new PageResponseDto(users, meta);
  }
  @Post(CREATE)
  async createNewUser(@Body() body: CreateUserDto) {
    return await this.userService.createNewUser(body);
  }
  @Get(GET_ALL)
  async findAllUser() {
    return await this.userService.findAll();
  }
  @ApiOperation({
    summary: 'Get a user',
    description: 'Allowed roles: ADMIN/CUSTOMER',
  })
  @ApiResponse({
    status: 400,
    description: 'Customer can only get themselves',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @Get(GET_ONE)
  async findUserById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.userService.findUserById(id);
  }
  @Post(UPDATE)
  async updateUserProfile(
    @UserSession() session: TUserSession,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return await this.userService.updateUserProfile(session, dto);
  }
  @Post(ENABLE)
  async enableUserById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.userService.enableUserById(id);
  }
  @Post(DISABLE)
  async disableUserById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.userService.disableUserById(id);
  }
}
