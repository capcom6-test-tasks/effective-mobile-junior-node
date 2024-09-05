import { Controller, HttpCode, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { ResetResponse } from './users.dto';

@Controller('users')
export class UsersController {
    public constructor(
        private readonly usersService: UsersService
    ) { }

    @Post('reset')
    @HttpCode(200)
    public async reset(): Promise<ResetResponse> {
        return {
            affected: await this.usersService.reset()
        };
    }
}
