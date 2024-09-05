import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('problems')
export class Problem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;
    @OneToOne(() => User, (user) => user.problem, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;
}