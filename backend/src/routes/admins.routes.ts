import {Router} from 'express';
import { loginAdmin } from '../controllers/admins.controller';

const router = Router();

router.post('/login', loginAdmin);

export default router;