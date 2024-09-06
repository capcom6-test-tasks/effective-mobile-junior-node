import { MigrationInterface, QueryRunner } from "typeorm";


export class Migrations1725591331836 implements MigrationInterface {
    name = 'Migrations1725591331836'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_gender_enum" AS ENUM('male', 'female')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "age" integer NOT NULL, "gender" "public"."users_gender_enum" NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "problems" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, CONSTRAINT "REL_5be7092c979e0414c8851beafb" UNIQUE ("userId"), CONSTRAINT "PK_b3994afba6ab64a42cda1ccaeff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "problems" ADD CONSTRAINT "FK_5be7092c979e0414c8851beafb9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "problems" DROP CONSTRAINT "FK_5be7092c979e0414c8851beafb9"`);
        await queryRunner.query(`DROP TABLE "problems"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`);
    }

}
