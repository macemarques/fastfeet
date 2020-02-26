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
import PackageStatusController from './app/controllers/PackageStatusController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

routes.post('/users', UserController.store);
routes.put('/users', authMiddleware, UserController.update);

routes.post('/recipients', authMiddleware, RecipientController.store);
routes.get('/recipients', authMiddleware, RecipientController.index);
routes.put('/recipients/edit/:id', authMiddleware, RecipientController.update);

routes.post(
  '/files',
  authMiddleware,
  upload.single('file'),
  FileController.store
);
routes.post('/files/signatures', upload.single('file'), FileController.store);

routes.post('/couriers', authMiddleware, CourierController.store);
routes.get('/couriers', authMiddleware, CourierController.index);
routes.put(
  '/couriers/edit/:courier_id',
  authMiddleware,
  CourierController.update
);
routes.delete(
  '/couriers/delete/:courier_id',
  authMiddleware,
  CourierController.destroy
);
routes.get('/couriers/:courier_id/deliveries', PackageController.index);
routes.get('/couriers/:courier_id/delivered', PackageStatusController.show);

routes.get('/packages', authMiddleware, PackageController.index);
routes.get('/packages/:courier_id', authMiddleware, PackageController.show);
routes.put('/packages/:package_id', authMiddleware, PackageController.update);
routes.post('/packages', authMiddleware, PackageController.store);
routes.delete(
  '/packages/remove/:package_id',
  authMiddleware,
  PackageController.destroy
);

routes.put('/packages/pickup/:package_id', PackageStatusController.update);
routes.put('/packages/delivered/:package_id', PackageStatusController.update);

routes.get(
  '/delivery/problems',
  authMiddleware,
  DeliveryProblemController.index
);
routes.get(
  '/delivery/:package_id/problems',
  authMiddleware,
  DeliveryProblemController.show
);
routes.post('/delivery/:package_id/problems', DeliveryProblemController.store);
routes.delete(
  '/problem/:delivery_problem_id/cancel-delivery',
  authMiddleware,
  DeliveryProblemController.destroy
);

export default routes;
