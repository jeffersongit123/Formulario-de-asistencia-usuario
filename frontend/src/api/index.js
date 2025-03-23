import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const verificarEmpleado = async (cedula) => {
  try {
    const response = await axios.get(`${API_URL}/empleados/cedula/${cedula}`);
    return response.data;
  } catch (error) {
    throw new Error('Empleado no encontrado');
  }
};

export const registrarAsistencia = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/asistencias`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al registrar asistencia');
  }
};