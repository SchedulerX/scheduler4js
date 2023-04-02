import { Model } from "sequelize/types";

export class ParentModel<T extends {}, K extends {}> extends Model<T, K> {}
