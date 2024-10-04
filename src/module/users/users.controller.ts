import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DOCUMENTATION, END_POINTS } from 'src/utils/constants';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

const {
  USERS: { BASE, GET_ALL, CREATE },
} = END_POINTS;

@ApiTags(DOCUMENTATION.TAGS.USERS)
@Controller(BASE)
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @Get(GET_ALL)
  async getAllUsers() {}
  @Post(CREATE)
  async createNewUser(@Body() body: CreateUserDto) {
    return await this.userService.createNewUser(body);
  }
  @Get(GET_ALL)
  async findAllUser() {
    return await this.userService.findAll();
  }
  @Get(':id')
  async findUserById(@Param() id: string) {
    return await this.userService.findUserById(id);
  }
}
