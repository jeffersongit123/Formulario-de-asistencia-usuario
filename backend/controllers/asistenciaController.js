import { AsistenciaService } from '../services/asistenciaService.js';

export const registrarAsistencia = async (req, res) => {
  try {
    const { cedula, tipo_registro } = req.body;
    // Agregar validaciones básicas
    if (!cedula || !tipo_registro) {
      return res.status(400).json({ error: 'La cédula y tipo de registro son obligatorios' });
    }
    if (tipo_registro !== 'entrada' && tipo_registro !== 'salida') {
      return res.status(400).json({ error: 'Tipo de registro inválido' });
    }
    
    const resultado = await AsistenciaService.registrarAsistencia({
      cedula,
      tipo_registro
    });
    res.status(201).json(resultado);
  } catch (error) {
    // Mejorar el manejo de errores
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    res.status(statusCode).json({ error: error.message });
  }
};