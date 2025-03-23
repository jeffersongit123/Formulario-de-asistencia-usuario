import supabase from '../db.js';

export class AsistenciaService {
  static async registrarAsistencia({ cedula, tipo_registro }) {
    try {
      // Buscar empleado por cédula
      const { data: empleado, error: errorEmpleado } = await supabase
        .from('empleados')
        .select('*')
        .eq('cedula', cedula)
        .single();

      if (errorEmpleado || !empleado) {
        throw new Error('Empleado no encontrado');
      }

      // Obtener hora actual
      const ahora = new Date();
      const horaActual = ahora.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(/\s/, ' ');

      // Determinar estado
      let estado = 'A tiempo';
      if (tipo_registro === 'entrada') {
        const [horaEntrada, periodoEntrada] = empleado.horario_entrada.split(' ');
        const [horaActualStr, periodoActual] = horaActual.split(' ');
        
        const getMinutos = (hora, periodo) => {
          const [h, m] = hora.split(':');
          let horas = parseInt(h);
          if (periodo.toLowerCase().includes('pm') && horas !== 12) horas += 12;
          if (periodo.toLowerCase().includes('am') && horas === 12) horas = 0;
          return horas * 60 + parseInt(m);
        };

        const minutosEntrada = getMinutos(horaEntrada, periodoEntrada);
        const minutosActual = getMinutos(horaActualStr, periodoActual);

        if (minutosActual > minutosEntrada) {
          estado = 'Retrasado';
        }
      } else if (tipo_registro === 'salida') {
        const { data: registroEntrada } = await supabase
          .from('asistencias')
          .select('*')
          .eq('empleado_id', empleado.id)
          .eq('fecha', ahora.toISOString().split('T')[0])
          .single();

        if (!registroEntrada) {
          throw new Error('No hay registro de entrada para hoy');
        }

        // Actualizar el registro existente con la hora de salida
        const { data, error } = await supabase
          .from('asistencias')
          .update({ salida: horaActual })
          .eq('id', registroEntrada.id)
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

      // Solo crear nuevo registro si es entrada
      if (tipo_registro === 'entrada') {
        const { data, error } = await supabase
          .from('asistencias')
          .insert([{
            empleado_id: empleado.id,
            fecha: ahora.toISOString().split('T')[0],
            entrada: horaActual,
            estado
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
      }

    } catch (error) {
      throw new Error(error.message);
    }
  }
}