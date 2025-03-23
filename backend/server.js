import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import empleadosRoutes from './routes/empleados.js';
import asistenciasRoutes from './routes/asistencias.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Actualiza la configuración CORS para aceptar ambos puertos
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5175']
}));

app.use(express.json());
app.use('/empleados', empleadosRoutes);
app.use('/asistencias', asistenciasRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});