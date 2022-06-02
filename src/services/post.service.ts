import { Request } from 'express';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { AppDataSource } from '../utils/data-source';

const postRepository = AppDataSource.getRepository(Post);

export const createPost = async (input: Partial<Post>, user: User) => {
  return await postRepository.save(postRepository.create({ ...input, user }));
};

export const getPost = async (postId: string) => {
  return await postRepository.findOneBy({ id: postId });
};

export const findPosts = async (req: Request) => {
  const builder = postRepository.createQueryBuilder('post');

  if (req.query.search) {
    builder.where('post.title LIKE :search OR post.content LIKE :search', {
      search: `%${req.query.search}%`,
    });
  }

  if (req.query.sort) {
    const sortQuery = req.query.sort === '-price' ? 'DESC' : 'ASC';
    builder.orderBy('post.title', sortQuery);
  }

  return await builder.getMany();
};
