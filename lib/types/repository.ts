import { CreateOptions, FindOptions, UpdateOptions } from "sequelize";

export interface ISchedulerRepository<T> {
  findOne<T>(query: FindOptions<T>): Promise<T>;
  update<T>(
    data: Partial<T>,
    query: UpdateOptions
  ): Promise<{ count: number; rows: T[] }>;
  save<T>(t: T, option: CreateOptions): Promise<T>;
}
