import express from 'express';
import supabase from '../db.js';

const router = express.Router();

router.get('/cedula/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    
    // Añade un console.log para debug
    console.log('Buscando cédula:', cedula);
    
    const { data: empleado, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('cedula', cedula)
      .single();

    // Añade un console.log para ver la respuesta de Supabase
    console.log('Respuesta de Supabase:', { empleado, error });

    if (error || !empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    res.json(empleado);
  } catch (error) {
    console.error('Error en la búsqueda:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;