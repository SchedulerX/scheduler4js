import {
  Attributes,
  CreateOptions,
  FindOptions,
  Model,
  UpdateOptions,
} from "sequelize";

export interface ISchedulerRepository<T extends Model> {
  findOne(query: FindOptions<T>): Promise<T>;
  update(
    data: Partial<T>,
    options: Omit<UpdateOptions<Attributes<T>>, "returning"> & {
      returning: Exclude<
        UpdateOptions<Attributes<T>>["returning"],
        undefined | false
      >;
    }
  ): Promise<{ count: number; rows: T[] }>;
  update(data: Partial<T>, query: UpdateOptions): Promise<number>;
  save(t: Partial<T>, option: CreateOptions): Promise<T>;
}
