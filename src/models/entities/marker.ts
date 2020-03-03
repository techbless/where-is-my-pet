import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export class Marker extends BaseEntity {
  @PrimaryGeneratedColumn()
  m_id!: number;

  @Column()
  latitude!: string;

  @Column()
  longitude!: string;

  @Column()
  comment!: string;

  @Column()
  type!: string;

  @Column({ type: "datetime" })
  f_time!: string;

  @Column({ nullable: true })
  img_url!: string;

  @Column()
  auth!: string;
}
