import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Problem } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Problem])],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule { }
