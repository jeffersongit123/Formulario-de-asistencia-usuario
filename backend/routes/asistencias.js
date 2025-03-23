import express from 'express';
import { registrarAsistencia } from '../controllers/asistenciaController.js';

const router = express.Router();

router.post('/', registrarAsistencia);

export default router;