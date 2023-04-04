import { CreateOptions, FindOptions, UpdateOptions } from "sequelize";

export interface ISchedulerRepository<T> {
  findOne(query: FindOptions<T>): Promise<T>;
  update(
    data: Partial<T>,
    query: UpdateOptions
  ): Promise<{ count: number; rows: T[] }>;
  save(t: Partial<T>, option: CreateOptions): Promise<T>;
}
