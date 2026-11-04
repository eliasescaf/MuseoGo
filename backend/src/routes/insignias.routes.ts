import {Router} from "express";
import type { Router as ExpressRouter } from "express";
import {getInsignias, createInsignia, updateInsignia, deleteInsignia, getTiposInsignia, getInsigniasVisitante} from "../controllers/insignias.controller";

const router: ExpressRouter = Router();

router.get('/', getInsignias);
router.post('/', createInsignia);
router.put('/:id', updateInsignia);
router.delete('/:id', deleteInsignia);
router.get('/tipos', getTiposInsignia);
router.get('/visitante/:visitanteId', getInsigniasVisitante);

export default router;
