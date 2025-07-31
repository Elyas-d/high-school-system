import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { isAuthenticated } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validateDto } from '../common/middleware/validateDto';
import { CreateUserDto } from '../modules/user/dto/CreateUserDto';

const router = Router();
const userController = new UserController();

router.get('/', isAuthenticated, authorize(['ADMIN']), userController.list);
router.get('/:id', isAuthenticated, authorize(['ADMIN']), userController.getById);
router.post('/', isAuthenticated, authorize(['ADMIN']), validateDto(CreateUserDto), userController.create);
router.put('/:id', isAuthenticated, authorize(['ADMIN']), userController.update);
router.delete('/:id', isAuthenticated, authorize(['ADMIN']), userController.delete);

export default router; 