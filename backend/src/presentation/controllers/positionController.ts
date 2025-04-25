import { Request, Response } from 'express';
import { 
  getAllPositions, 
  findPositionById, 
  createPosition, 
  updatePosition
} from '../../application/services/positionService';
import {
  getCandidatesByPosition,
  createApplication,
  updateCandidateStage
} from '../../application/services/applicationService';

/**
 * Obtiene todas las posiciones
 */
export const getPositionsController = async (req: Request, res: Response) => {
  try {
    // Extraer filtros de la query string
    const filters: { 
      status?: string; 
      companyId?: number; 
      isVisible?: boolean 
    } = {};

    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.companyId) filters.companyId = parseInt(req.query.companyId as string);
    if (req.query.isVisible) filters.isVisible = (req.query.isVisible as string) === 'true';

    const positions = await getAllPositions(filters);
    res.status(200).json(positions);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error obteniendo posiciones', error: error.message });
    } else {
      res.status(500).json({ message: 'Error obteniendo posiciones', error: 'Error desconocido' });
    }
  }
};

/**
 * Obtiene una posición por su ID
 */
export const getPositionByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de posición inválido' });
    }

    const position = await findPositionById(id);
    if (!position) {
      return res.status(404).json({ error: 'Posición no encontrada' });
    }

    res.status(200).json(position);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error obteniendo posición', error: error.message });
    } else {
      res.status(500).json({ message: 'Error obteniendo posición', error: 'Error desconocido' });
    }
  }
};

/**
 * Crea una nueva posición
 */
export const createPositionController = async (req: Request, res: Response) => {
  try {
    const positionData = req.body;
    const position = await createPosition(positionData);
    res.status(201).json({ 
      message: 'Posición creada exitosamente', 
      data: position 
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ message: 'Error creando posición', error: error.message });
    } else {
      res.status(500).json({ message: 'Error creando posición', error: 'Error desconocido' });
    }
  }
};

/**
 * Actualiza una posición existente
 */
export const updatePositionController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de posición inválido' });
    }

    const positionData = req.body;
    const position = await updatePosition(id, positionData);
    
    res.status(200).json({ 
      message: 'Posición actualizada exitosamente', 
      data: position 
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'Posición no encontrada') {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ message: 'Error actualizando posición', error: error.message });
    } else {
      res.status(500).json({ message: 'Error actualizando posición', error: 'Error desconocido' });
    }
  }
};

/**
 * Obtiene los candidatos que han aplicado a una posición específica
 */
export const getCandidatesByPositionController = async (req: Request, res: Response) => {
  try {
    const positionId = parseInt(req.params.id);
    if (isNaN(positionId)) {
      return res.status(400).json({ error: 'ID de posición inválido' });
    }
    
    const candidates = await getCandidatesByPosition(positionId);
    res.status(200).json(candidates);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'La posición no existe') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ message: 'Error obteniendo candidatos', error: error.message });
    } else {
      res.status(500).json({ message: 'Error obteniendo candidatos', error: 'Error desconocido' });
    }
  }
};

/**
 * Actualiza la etapa de entrevista de un candidato en una posición
 */
export const updateCandidateStageController = async (req: Request, res: Response) => {
  try {
    const positionId = parseInt(req.params.id);
    const candidateId = parseInt(req.params.candidateId);
    const { stageId, notes } = req.body;
    
    if (isNaN(positionId)) {
      return res.status(400).json({ error: 'ID de posición inválido' });
    }
    
    if (isNaN(candidateId)) {
      return res.status(400).json({ error: 'ID de candidato inválido' });
    }
    
    if (!stageId || isNaN(parseInt(stageId.toString()))) {
      return res.status(400).json({ error: 'ID de etapa inválido o no proporcionado' });
    }
    
    const result = await updateCandidateStage(
      positionId,
      candidateId,
      parseInt(stageId.toString()),
      notes
    );
    
    res.status(200).json({
      message: 'Etapa del candidato actualizada exitosamente',
      data: result
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (
        error.message === 'La posición no existe' ||
        error.message === 'El candidato no existe' ||
        error.message === 'La etapa de entrevista no existe' ||
        error.message === 'No existe una aplicación para este candidato en esta posición'
      ) {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ message: 'Error actualizando etapa del candidato', error: error.message });
    } else {
      res.status(500).json({ message: 'Error actualizando etapa del candidato', error: 'Error desconocido' });
    }
  }
};

/**
 * Crea una nueva aplicación para un candidato a una posición
 */
export const createApplicationController = async (req: Request, res: Response) => {
  try {
    const { candidateId, currentInterviewStep, notes } = req.body;
    const positionId = parseInt(req.params.id);

    if (isNaN(positionId)) {
      return res.status(400).json({ error: 'ID de posición inválido' });
    }

    if (!candidateId || !currentInterviewStep) {
      return res.status(400).json({ error: 'Faltan datos obligatorios para la aplicación' });
    }

    const application = await createApplication({
      positionId,
      candidateId,
      currentInterviewStep,
      notes
    });
    
    res.status(201).json({ 
      message: 'Aplicación creada exitosamente', 
      data: application 
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'La posición no existe') {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ message: 'Error creando aplicación', error: error.message });
    } else {
      res.status(500).json({ message: 'Error creando aplicación', error: 'Error desconocido' });
    }
  }
}; 