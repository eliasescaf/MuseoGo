import {Router} from "express";
import type { Router as ExpressRouter } from "express";
import {getCaminos, createCamino, updateCamino, deleteCamino, getCaminoById} from "../controllers/caminos.controller";

const router: ExpressRouter = Router();

router.get('/', getCaminos);
router.post('/', createCamino);
router.put('/:id', updateCamino);
router.delete('/:id', deleteCamino);
router.get('/:id', getCaminoById);

export default router;