import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Problem, User } from './entities';

@Injectable()
export class UsersService {
    public constructor(
        @InjectRepository(User)
        private readonly users: Repository<User>,
        @InjectRepository(Problem)
        private readonly problems: Repository<Problem>,
    ) {

    }

    public async reset(): Promise<number> {
        const res = await this.problems.delete({});

        return res.affected;
    }
}
