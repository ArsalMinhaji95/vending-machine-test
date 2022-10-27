import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user';

@Table
export class Product extends Model<Product> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  })
  product_id: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    unique: true,
  })
  product_name: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  amount_avb: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  cost: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  seller_id: number;

  @BelongsTo(() => User, {
    onDelete: 'CASCADE',
  })
  user: User;
}
