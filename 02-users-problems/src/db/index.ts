import { DataSource, DataSourceOptions } from "typeorm";

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost/em-users',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',

    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    migrationsRun: process.env.NODE_ENV === 'production',
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;