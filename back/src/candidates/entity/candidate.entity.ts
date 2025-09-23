import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Candidate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  surname: string;

  @Column({ type: 'text' })
  seniority: 'junior' | 'senior';

  @Column('integer')
  yearsOfExperience: number;

  @Column('boolean')
  availability: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}