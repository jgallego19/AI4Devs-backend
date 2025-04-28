import { Position } from '../../domain/models/Position';

/**
 * Obtiene los candidatos asociados a una posición específica
 * @param positionId ID de la posición
 * @param page Número de página (opcional, por defecto 1)
 * @param pageSize Tamaño de página (opcional, por defecto 20)
 * @returns Lista de candidatos con su etapa actual y puntuación promedio
 */
export const getCandidatesByPositionId = async (
    positionId: number, 
    page: number = 1, 
    pageSize: number = 20
) => {
    try {
        // Validar que el ID sea un número entero positivo
        const id = Number(positionId);
        if (isNaN(id) || id <= 0) {
            throw new Error('ID de posición inválido');
        }
        
        // Llamar al método del modelo Position
        return await Position.getCandidates(id, page, pageSize);
    } catch (error: any) {
        // Capturar y relanzar errores con mensajes más descriptivos
        if (error.message === 'Posición no encontrada') {
            throw { status: 404, message: 'No se encontró la posición con el ID especificado' };
        }
        if (error.message === 'ID de posición inválido') {
            throw { status: 400, message: 'El ID de posición debe ser un número entero positivo' };
        }
        
        // Para otros errores inesperados
        console.error('Error al obtener candidatos por posición:', error);
        throw { status: 500, message: 'Error interno al procesar la solicitud' };
    }
}; 