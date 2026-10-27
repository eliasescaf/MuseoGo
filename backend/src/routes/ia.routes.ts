import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { evaluarRespuesta } from "../controllers/ia.controller";

const router: ExpressRouter = Router();

router.post("/evaluar", evaluarRespuesta);

export default router;
