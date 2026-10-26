import {Router} from 'express';
import { registrarVisitante, obtenerProgreso, obtenerResultadosCamino } from '../controllers/visitantes.controller';

const router = Router();

router.post("/", registrarVisitante);
router.get("/:visitanteId/progreso", obtenerProgreso);
router.get("/:visitanteId/caminos/:caminoId/resultados", obtenerResultadosCamino);

export default router;