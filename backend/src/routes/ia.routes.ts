import {Router} from "express";
import { consultaGuiaVirtual } from "../controllers/ia.controller";

const router = Router();

router.post('/chat', consultaGuiaVirtual);

export default router;
