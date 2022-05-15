import express from 'express';
import {
  createPostHandler,
  deletePostHandler,
  getPostHandler,
  getPostsHandler,
  updatePostHandler,
} from '../controllers/post.controller';
import { deserializeUser } from '../middleware/deserializeUser';
import { requireUser } from '../middleware/requireUser';
import { validate } from '../middleware/validate';
import {
  createPostSchema,
  deletePostSchema,
  getPostSchema,
  updatePostSchema,
} from '../schemas/post.schema';
import { uploadPostImageDisk } from '../upload/single-upload-disk';

const router = express.Router();

router.use(deserializeUser, requireUser);
router
  .route('/')
  .post(uploadPostImageDisk, validate(createPostSchema), createPostHandler)
  .get(getPostsHandler);

router
  .route('/:postId')
  .get(validate(getPostSchema), getPostHandler)
  .patch(uploadPostImageDisk, updatePostHandler)
  .delete(validate(deletePostSchema), deletePostHandler);

export default router;
