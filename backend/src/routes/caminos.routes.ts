import {Router} from "express";
import {getCaminos, createCamino} from "../controllers/caminos.controller";

const router = Router();

router.get('/', getCaminos);
router.post('/', createCamino);

export default router;