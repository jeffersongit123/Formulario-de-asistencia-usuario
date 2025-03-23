import { useState, useEffect } from 'react';
import { verificarEmpleado, registrarAsistencia } from '../api';

const AsistenciaForm = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [formData, setFormData] = useState({
    cedula: '',
    tipo_registro: 'entrada'
  });
  const [empleado, setEmpleado] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCedulaChange = async (e) => {
    const cedula = e.target.value;
    setFormData(prev => ({ ...prev, cedula }));
    
    if (cedula.length === 10) {
      try {
        const data = await verificarEmpleado(cedula);
        setEmpleado(data);
        setMensaje({
          tipo: 'success',
          texto: `Empleado encontrado: ${data.nombre}`
        });
      } catch (error) {
        setEmpleado(null);
        setMensaje({
          tipo: 'error',
          texto: 'Empleado no encontrado'
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!empleado) return;

    try {
      const response = await registrarAsistencia({
        cedula: formData.cedula,
        tipo_registro: formData.tipo_registro
      });

      setMensaje({
        tipo: 'success',
        texto: `${formData.tipo_registro === 'entrada' ? 
          `Entrada registrada: ${empleado.nombre} - ${response.estado}` : 
          `Salida registrada: ${empleado.nombre}`}`
      });

      setFormData({ cedula: '', tipo_registro: 'entrada' });
      setEmpleado(null);
    } catch (error) {
      setMensaje({
        tipo: 'error',
        texto: error.message
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-700">
            {currentTime.toLocaleDateString('es-ES', {
              weekday: 'short',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h2>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {currentTime.toLocaleTimeString('es-ES')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <select
              value={formData.tipo_registro}
              onChange={(e) => setFormData(prev => ({ ...prev, tipo_registro: e.target.value }))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              <option value="entrada">Hora de Entrada</option>
              <option value="salida">Hora de Salida</option>
            </select>
          </div>

          <div>
            <input
              type="text"
              placeholder="Ingrese su cédula"
              value={formData.cedula}
              onChange={handleCedulaChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              maxLength="10"
              pattern="\d{10}"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!empleado}
            className={`w-full p-2 rounded-md text-white ${
              empleado ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Registrar
          </button>
        </form>

        {mensaje && (
          <div className={`mt-4 p-3 rounded-md ${
            mensaje.tipo === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {mensaje.texto}
          </div>
        )}
      </div>
    </div>
  );
};

export default AsistenciaForm;