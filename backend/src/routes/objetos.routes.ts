import {Router} from "express";
import { getObjetos, createObjeto, updateObjeto, deleteObjeto, getObjetoById } from "../controllers/objetos.controller";

const router = Router();

router.get('/', getObjetos);
router.post('/', createObjeto);
router.put('/:id', updateObjeto);
router.delete('/:id', deleteObjeto);
router.get('/:id', getObjetoById);

export default router;