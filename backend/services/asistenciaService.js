import supabase from '../db.js';

export class AsistenciaService {
  static async registrarAsistencia({ cedula, tipo_registro }) {
    try {
      // Buscar empleado
      const { data: empleado, error: errorEmpleado } = await supabase
        .from('empleados')
        .select('*')
        .eq('cedula', cedula)
        .single();

      if (errorEmpleado || !empleado) {
        throw new Error('Empleado no encontrado');
      }

      const ahora = new Date();
      const horaActual = ahora.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(/\s/, ' ');

      // Verificar si ya existe un registro para hoy
      const { data: registroExistente } = await supabase
        .from('asistencias')
        .select('*')
        .eq('empleado_id', empleado.id)
        .eq('fecha', ahora.toISOString().split('T')[0])
        .single();

      // Función para convertir hora en minutos
      const getMinutos = (horaStr, periodo) => {
        const [h, m] = horaStr.split(':');
        let horas = parseInt(h);
        if (periodo.toLowerCase().includes('pm') && horas !== 12) horas += 12;
        if (periodo.toLowerCase().includes('am') && horas === 12) horas = 0;
        return horas * 60 + parseInt(m);
      };

      if (tipo_registro === 'entrada') {
        // Validar que no haya registrado entrada hoy
        if (registroExistente?.entrada) {
          throw new Error('Ya registraste tu entrada hoy');
        }

        const [horaEntrada, periodoEntrada] = empleado.horario_entrada.split(' ');
        const [horaActualStr, periodoActual] = horaActual.split(' ');
        
        const minutosEntrada = getMinutos(horaEntrada, periodoEntrada);
        const minutosActual = getMinutos(horaActualStr, periodoActual);
        const diferenciaMinutos = minutosActual - minutosEntrada;

        // Determinar estado (con 5 minutos de tolerancia)
        let estado = 'A tiempo';
        if (diferenciaMinutos > 5) {
          estado = 'Retrasado';
        }

        // Crear nuevo registro
        const { data, error } = await supabase
          .from('asistencias')
          .insert([{
            empleado_id: empleado.id,
            fecha: ahora.toISOString().split('T')[0],
            entrada: horaActual,
            estado,
            salida: 'En espera'
          }])
          .select();

        if (error) throw error;
        return {
          ...data[0],
          empleado: {
            nombre: empleado.nombre,
            cedula: empleado.cedula,
            posicion: empleado.posicion
          }
        };

      } else if (tipo_registro === 'salida') {
        // Validar que exista registro de entrada
        if (!registroExistente) {
          throw new Error('No hay registro de entrada para hoy');
        }

        // Validar que no haya registrado salida
        if (registroExistente.salida !== 'En espera') {
          throw new Error('Ya registraste tu salida hoy');
        }

        const [horaSalida, periodoSalida] = empleado.horario_salida.split(' ');
        const [horaActualStr, periodoActual] = horaActual.split(' ');
        
        const minutosSalida = getMinutos(horaSalida, periodoSalida);
        const minutosActual = getMinutos(horaActualStr, periodoActual);
        const diferenciaMinutos = minutosActual - minutosSalida;

        // Validar si intenta salir muy temprano
        if (diferenciaMinutos < -5) {
          throw new Error('No puedes registrar la salida antes del horario establecido');
        }

        // Mantener el estado original del registro
        const { data, error } = await supabase
          .from('asistencias')
          .update({ 
            salida: horaActual
            // Ya no modificamos el estado
          })
          .eq('id', registroExistente.id)
          .select();

        if (error) throw error;
        return {
          ...data[0],
          empleado: {
            nombre: empleado.nombre,
            cedula: empleado.cedula,
            posicion: empleado.posicion
          }
        };
      }

    } catch (error) {
      throw new Error(error.message);
    }
  }
}