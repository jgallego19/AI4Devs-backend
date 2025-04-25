import { Position } from '../../domain/models/Position';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Obtiene todas las posiciones disponibles
 * @param filters Filtros opcionales (status, companyId, etc.)
 * @returns Lista de posiciones
 */
export const getAllPositions = async (filters?: {
  status?: string;
  companyId?: number;
  isVisible?: boolean;
}): Promise<Position[]> => {
  try {
    const whereClause: any = {};
    
    if (filters) {
      if (filters.status) whereClause.status = filters.status;
      if (filters.companyId) whereClause.companyId = filters.companyId;
      if (filters.isVisible !== undefined) whereClause.isVisible = filters.isVisible;
    }

    const positions = await prisma.position.findMany({
      where: whereClause,
      include: {
        company: true,
        interviewFlow: true
      }
    });

    return positions.map((positionData: any) => new Position(positionData));
  } catch (error) {
    console.error('Error al obtener las posiciones:', error);
    throw new Error('Error al recuperar las posiciones');
  }
};

/**
 * Obtiene una posición por su ID
 * @param id ID de la posición
 * @returns Posición encontrada o null si no existe
 */
export const findPositionById = async (id: number): Promise<Position | null> => {
  try {
    const position = await Position.findOne(id);
    return position;
  } catch (error) {
    console.error('Error al buscar la posición:', error);
    throw new Error('Error al recuperar la posición');
  }
};

/**
 * Crea una nueva posición
 * @param positionData Datos de la posición
 * @returns Posición creada
 */
export const createPosition = async (positionData: Record<string, any>): Promise<Position> => {
  try {
    // Aquí podrías añadir validación de los datos de la posición
    // similar a validateCandidateData en candidateService
    
    const position = new Position(positionData);
    const savedPosition = await position.save();
    return position;
  } catch (error: any) {
    console.error('Error al crear la posición:', error);
    throw error;
  }
};

/**
 * Actualiza una posición existente
 * @param id ID de la posición
 * @param positionData Datos actualizados
 * @returns Posición actualizada
 */
export const updatePosition = async (id: number, positionData: Record<string, any>): Promise<Position> => {
  try {
    const position = await Position.findOne(id);
    if (!position) {
      throw new Error('Posición no encontrada');
    }

    // Actualizar propiedades
    for (const [key, value] of Object.entries(positionData)) {
      (position as any)[key] = value;
    }
    
    const updatedPosition = await position.save();
    return position;
  } catch (error) {
    console.error('Error al actualizar la posición:', error);
    throw error;
  }
}; 