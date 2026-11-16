import {Router} from "express";
import type { Router as ExpressRouter } from "express";
import {crearSala, unirseSala, getSalaActiva, getSala, iniciarSala, finalizarSala, abandonarSala} from "../controllers/salas.controller";

const router: ExpressRouter = Router();

router.post('/', crearSala);
router.post('/unirse', unirseSala);
router.get('/activa/:visitanteId', getSalaActiva);
router.get('/:id', getSala);
router.post('/:id/iniciar', iniciarSala);
router.post('/:id/finalizar', finalizarSala);
router.post('/:id/abandonar', abandonarSala);

export default router;
