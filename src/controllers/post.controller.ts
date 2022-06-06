import { NextFunction, Request, Response } from 'express';
import {
  CreatePostInput,
  DeletePostInput,
  GetPostInput,
  UpdatePostInput,
} from '../schemas/post.schema';
import { createPost, findPosts, getPost } from '../services/post.service';
import { findUserById } from '../services/user.service';
import AppError from '../utils/appError';

export const createPostHandler = async (
  req: Request<{}, {}, CreatePostInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await findUserById(res.locals.user.id as string);

    const post = await createPost(req.body, user!);

    res.status(201).json({
      status: 'success',
      data: {
        post,
      },
    });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({
        status: 'fail',
        message: 'Post with that title already exist',
      });
    }
    next(err);
  }
};

export const getPostHandler = async (
  req: Request<GetPostInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await getPost(req.params.postId);

    if (!post) {
      return next(new AppError(404, 'Post with that ID not found'));
    }

    res.status(200).json({
      status: 'success',
      data: {
        post,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const getPostsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const posts = await findPosts({}, {}, { user: true });

    res.status(200).json({
      status: 'success',
      data: {
        posts,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const updatePostHandler = async (
  req: Request<UpdatePostInput['params'], {}, UpdatePostInput['body']>,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await getPost(req.params.postId);

    if (!post) {
      return next(new AppError(404, 'Post with that ID not found'));
    }

    Object.assign(post, req.body);

    const updatedPost = await post.save();

    res.status(200).json({
      status: 'success',
      data: {
        post: updatedPost,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const deletePostHandler = async (
  req: Request<DeletePostInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await getPost(req.params.postId);

    if (!post) {
      return next(new AppError(404, 'Post with that ID not found'));
    }

    await post.remove();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err: any) {
    next(err);
  }
};

export const parsePostFormData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.data) return next();
    const parsedBody = { ...JSON.parse(req.body.data) };
    if (req.body.image) {
      parsedBody['image'] = req.body.image;
    }

    req.body = parsedBody;
    next();
  } catch (err: any) {
    next(err);
  }
};
