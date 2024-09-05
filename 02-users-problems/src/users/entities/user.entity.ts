import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Problem } from "./problem.entity";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({
        type: "int",
        unsigned: true,
    })
    age: number;

    @Column({
        type: "enum",
        enum: ["male", "female"],
    })
    gender: string;

    @OneToOne(() => Problem, (problem) => problem.user, { onDelete: 'CASCADE' })
    problem: Problem;
}