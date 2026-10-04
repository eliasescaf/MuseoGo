import {Router} from 'express';
import { getMisiones, createMision, updateMision, deleteMision, getMisionById } from '../controllers/misiones.controller';

const router = Router();

router.get('/', getMisiones);
router.post('/', createMision);
router.put('/:id', updateMision);
router.delete('/:id', deleteMision);
router.get('/:id', getMisionById);

export default router;