import path from 'path';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import {
  resizePostImages,
  uploadPostImages,
} from './upload/multi-upload-sharp';
import { resizePostImage, uploadPostImage } from './upload/single-upload-sharp';

const app = express();

app.use('/api/static', express.static(path.join(__dirname, '../public')));
app.use(express.json({ limit: '10kb' }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(
  cors({
    origin: ['localhost:3000'],
    credentials: true,
  })
);

app.post(
  '/upload',
  uploadPostImages,
  resizePostImages,
  (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: 'success',
      data: {
        image: req.body.image,
        images: req.body.images,
      },
    });
  }
);
app.post(
  '/upload/single',
  uploadPostImage,
  resizePostImage,
  (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: 'success',
      image: req.body.image,
    });
  }
);
app.post(
  '/upload/multiple',
  uploadPostImages,
  resizePostImages,
  (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: 'success',
      images: req.body.images,
    });
  }
);

app.get('/api/healthChecker', async (_, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to Image Upload in Node.js',
  });
});

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: 'fail',
    message: `Route ${req.originalUrl} not found`,
  });
});

const port = 8000;
app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});
