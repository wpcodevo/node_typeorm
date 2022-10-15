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
import multer from 'multer';
import sharp from 'sharp';

const multerStorage = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!file.mimetype.startsWith('image')) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'));
  }

  cb(null, true);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 5000000, files: 1 },
});

export const uploadPostImage = upload.single('image');

export const resizePostImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = req.file;
    if (!file) return next();

    const user = res.locals.user;

    const fileName = `user-${user.id}-${Date.now()}.jpeg`;
    await sharp(req.file?.buffer)
      .resize(800, 450)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`${__dirname}/../../public/posts/${fileName}`);

    req.body.image = fileName;

    next();
  } catch (err: any) {
    next(err);
  }
};

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
    const posts = await findPosts({}, {}, {});

    res.status(200).json({
      status: 'success',
      results: posts.length,
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
