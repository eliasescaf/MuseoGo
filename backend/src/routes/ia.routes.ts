import { Router } from "express";
import { evaluarRespuesta } from "../controllers/ia.controller";

const router = Router();

router.post("/evaluar", evaluarRespuesta);

export default router;
