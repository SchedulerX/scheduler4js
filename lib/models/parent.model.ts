/**
 * Author: Halil Baydar
 */

import { Model } from "sequelize";

export class ParentModel<T extends {}, K extends {}> extends Model<T, K> {}
