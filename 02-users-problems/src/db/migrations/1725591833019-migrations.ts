import { faker } from "@faker-js/faker";
import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1725591833019 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        for (let i = 0; i < 100; i++) {
            const res = await queryRunner.manager
                .createQueryBuilder()
                .insert()
                .into('users')
                .values(Array.from({ length: 10_000 }, () => ({
                    firstName: faker.person.firstName(),
                    lastName: faker.person.lastName(),
                    age: faker.number.int({ min: 18, max: 100 }),
                    gender: faker.helpers.arrayElement(['male', 'female'])
                })))
                .execute();
            await queryRunner.manager
                .createQueryBuilder()
                .insert()
                .into('problems')
                .values(res.identifiers
                    .filter(() => faker.number.int({ min: 0, max: 1 }) === 1)
                    .map(({ id }) => ({ userId: id }))
                )
                .execute();
        }


        // for (let i = 0; i < 1_000_000; i++) {
        //     const res = await queryRunner.query(`
        //         INSERT INTO "users" ("firstName", "lastName", "age", "gender") VALUES
        //         ($1, $2, $3, $4) RETURNING "id"
        //     `, [
        //         faker.person.firstName(),
        //         faker.person.lastName(),
        //         faker.number.int({ min: 18, max: 100 }),
        //         faker.helpers.arrayElement(['male', 'female'])
        //     ]);

        //     if (faker.number.int({ min: 0, max: 1 }) === 1) {
        //         await queryRunner.query(`INSERT INTO "problems" ("userId") VALUES ($1)`, [res[0].id]);
        //     }
        // }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`DELETE FROM "problems"`);
        queryRunner.query(`DELETE FROM "users"`);
    }

}
