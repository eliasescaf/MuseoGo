import {Router} from 'express';
import type { Router as ExpressRouter } from 'express';
import { loginAdmin } from '../controllers/admins.controller';

const router: ExpressRouter = Router();

router.post('/login', loginAdmin);

export default router;