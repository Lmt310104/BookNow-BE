import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { StandardResponse } from 'src/utils/response.dto';

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
    const user = await this.userService.createNewUser(body);
    return new StandardResponse(
      user,
      'Create user successfully',
      HttpStatus.CREATED,
    );
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
    const user = await this.userService.findUserById(id);
    return new StandardResponse(user, 'Get user successfully', HttpStatus.OK);
  }
  @Patch(UPDATE)
  async updateUserProfile(
    @UserSession() session: TUserSession,
    @Body() dto: UpdateUserProfileDto,
  ) {
    const user = await this.userService.updateUserProfile(session, dto);
    return new StandardResponse(
      user,
      'Update user profile successfully',
      HttpStatus.CREATED,
    );
  }
  @Post(ENABLE)
  async enableUserById(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.enableUserById(id);
    return new StandardResponse(
      user,
      'Enable user successfully',
      HttpStatus.CREATED,
    );
  }
  @Post(DISABLE)
  async disableUserById(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.disableUserById(id);
    return new StandardResponse(
      user,
      'Disable user successfully',
      HttpStatus.CREATED,
    );
  }
}
