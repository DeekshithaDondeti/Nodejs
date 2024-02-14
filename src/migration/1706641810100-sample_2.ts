import { MigrationInterface, QueryRunner } from "typeorm";

export class Sample21706641810100 implements MigrationInterface {
    name = 'Sample21706641810100'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "customer" ("Id" SERIAL NOT NULL, "FirstName" character varying NOT NULL, "LastName" character varying NOT NULL, "City" character varying NOT NULL, "Country" character varying NOT NULL, "Phone" character varying NOT NULL, CONSTRAINT "UQ_aa3796232636d8d45f6dfc141f4" UNIQUE ("Phone"), CONSTRAINT "PK_c20d5895eeff89de21d99c59f74" PRIMARY KEY ("Id"))`);
        await queryRunner.query(`CREATE TABLE "order" ("Id" SERIAL NOT NULL, "OrderDate" character varying NOT NULL, "CustomerId" integer NOT NULL, "TotalAmount" integer, "OrderNumber" character varying NOT NULL, CONSTRAINT "PK_afc28933d17e1c6eddef3a138a0" PRIMARY KEY ("Id"))`);
        await queryRunner.query(`CREATE TABLE "product" ("Id" SERIAL NOT NULL, "ProductName" character varying NOT NULL, "SupplierId" integer NOT NULL, "UnitPrice" integer NOT NULL, "Package" character varying NOT NULL, "IsDiscontinued" integer NOT NULL, "supplierId" integer, CONSTRAINT "PK_a22f8718d47066cb0a07aa5db66" PRIMARY KEY ("Id"))`);
        await queryRunner.query(`CREATE TABLE "supplier" ("Id" SERIAL NOT NULL, "CompanyName" character varying NOT NULL, "ContactName" character varying NOT NULL, "City" character varying NOT NULL, "Country" character varying NOT NULL, "Phone" character varying NOT NULL, "Fax" character varying, CONSTRAINT "UQ_b2ba7f3e437ebe9c404377c11cf" UNIQUE ("Phone"), CONSTRAINT "PK_088cb19f16a536ee9a2ba4bb221" PRIMARY KEY ("Id"))`);
        await queryRunner.query(`CREATE TABLE "order_item" ("Id" SERIAL NOT NULL, "OrderId" integer NOT NULL, "ProductId" integer NOT NULL, "UnitPrice" integer NOT NULL, "Quantity" integer NOT NULL, CONSTRAINT "PK_4faa14846c1e3ccc6e0518002cf" PRIMARY KEY ("Id"))`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_fe99ea4b136439e5913d78cc301" FOREIGN KEY ("CustomerId") REFERENCES "customer"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_4346e4adb741e80f3711ee09ba4" FOREIGN KEY ("supplierId") REFERENCES "supplier"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD CONSTRAINT "FK_c46004870e9380cc1c565f2fe2d" FOREIGN KEY ("OrderId") REFERENCES "order"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD CONSTRAINT "FK_7c8d70cba46da730465441955f6" FOREIGN KEY ("ProductId") REFERENCES "product"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_item" DROP CONSTRAINT "FK_7c8d70cba46da730465441955f6"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP CONSTRAINT "FK_c46004870e9380cc1c565f2fe2d"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_4346e4adb741e80f3711ee09ba4"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_fe99ea4b136439e5913d78cc301"`);
        await queryRunner.query(`DROP TABLE "order_item"`);
        await queryRunner.query(`DROP TABLE "supplier"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TABLE "customer"`);
    }

}
