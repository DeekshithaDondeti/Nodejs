import { DataSource } from "typeorm";
export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '12345678',
    database: 'sample',
    synchronize: true,
    logging: true,
    entities: ["./src/entities/*.ts"],
    migrations: ["./src/migration/*.ts"]
});
