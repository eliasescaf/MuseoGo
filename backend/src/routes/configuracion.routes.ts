import {Router} from "express";
import type { Router as ExpressRouter } from "express";
import {getConfiguracion, setConfiguracion} from "../controllers/configuracion.controller";

const router: ExpressRouter = Router();

router.get('/', getConfiguracion);
router.get('/:clave', getConfiguracion);
router.put('/', setConfiguracion);

export default router;
