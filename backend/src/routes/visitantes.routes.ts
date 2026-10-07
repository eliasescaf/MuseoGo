import {Router} from 'express';
import { registrarVisitante } from '../controllers/visitantes.controller';

const router = Router();

router.post("/", registrarVisitante);

export default router;