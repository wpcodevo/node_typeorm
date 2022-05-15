import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import Model from './model.entity';
import { User } from './user.entity';

@Entity('posts')
export class Post extends Model {
  @Column({
    unique: true,
  })
  title: string;

  @Column()
  content: string;

  @Column({
    default: 'default-post.png',
  })
  image: string;

  @Column({ type: 'simple-array' })
  images: string[];

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn()
  user: User;
}
