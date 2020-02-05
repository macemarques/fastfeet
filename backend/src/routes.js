import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import CourierController from './app/controllers/CourierController';
import PackageController from './app/controllers/PackageController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

routes.post('/users', UserController.store);
routes.put('/users', authMiddleware, UserController.update);

routes.post('/recipients', authMiddleware, RecipientController.store);
routes.put('/recipients/edit/:id', authMiddleware, RecipientController.update);

routes.post(
  '/files',
  authMiddleware,
  upload.single('file'),
  FileController.store
);

routes.post('/couriers', authMiddleware, CourierController.store);
routes.get('/couriers', authMiddleware, CourierController.show);
routes.put(
  '/couriers/edit/:courierId',
  authMiddleware,
  CourierController.update
);
routes.delete(
  '/couriers/delete/:courierId',
  authMiddleware,
  CourierController.destroy
);

routes.post('/packages', authMiddleware, PackageController.store);

export default routes;
