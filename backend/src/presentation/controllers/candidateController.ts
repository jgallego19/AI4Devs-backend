import { Request, Response } from 'express';
import { addCandidate, findCandidateById, getAllCandidates, updateCandidateStage } from '../../application/services/candidateService';

export const addCandidateController = async (req: Request, res: Response) => {
    try {
        const candidateData = req.body;
        const candidate = await addCandidate(candidateData);
        res.status(201).json({ message: 'Candidate added successfully', data: candidate });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ message: 'Error adding candidate', error: error.message });
        } else {
            res.status(400).json({ message: 'Error adding candidate', error: 'Unknown error' });
        }
    }
};

export const getCandidateById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const candidate = await findCandidateById(id);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.json(candidate);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getAllCandidatesController = async (req: Request, res: Response) => {
    try {
        // Obtener parámetros de paginación de la consulta
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 20;
        
        // Obtener los candidatos
        const result = await getAllCandidates(page, pageSize);
        
        // Devolver los candidatos y la información de paginación
        res.status(200).json({
            data: result.candidates,
            pagination: {
                total: result.total,
                page,
                pageSize,
                totalPages: Math.ceil(result.total / pageSize)
            }
        });
    } catch (error: any) {
        if (error.message && (
            error.message.includes('page') || 
            error.message.includes('pageSize')
        )) {
            return res.status(400).json({ error: error.message });
        }
        
        console.error('Error al obtener candidatos:', error);
        res.status(500).json({ error: 'Error interno al procesar la solicitud' });
    }
};

/**
 * Controlador para actualizar la etapa de un candidato
 * @param req Request con el ID del candidato en los parámetros y el ID de la etapa en el cuerpo
 * @param res Response para enviar la información actualizada
 */
export const updateCandidateStageController = async (req: Request, res: Response) => {
    try {
        // Obtener el ID del candidato de los parámetros
        const candidateId = parseInt(req.params.id);
        
        // Obtener el ID de la etapa de entrevista del cuerpo
        const { interview_step_id } = req.body;
        
        // Validar que el ID del candidato es un número válido
        if (isNaN(candidateId)) {
            return res.status(400).json({ error: 'Formato de ID de candidato inválido' });
        }
        
        // Validar que el ID de la etapa está presente y es un número
        if (!interview_step_id || isNaN(parseInt(interview_step_id))) {
            return res.status(400).json({ error: 'Debe proporcionar un ID de etapa de entrevista válido' });
        }
        
        // Actualizar la etapa del candidato
        const result = await updateCandidateStage(candidateId, parseInt(interview_step_id));
        
        // Devolver la información actualizada
        res.status(200).json(result);
    } catch (error: any) {
        // Manejar errores específicos del servicio
        if (error.message) {
            if (error.message.includes('no tiene una aplicación activa')) {
                return res.status(404).json({ error: 'El candidato no tiene una aplicación activa' });
            }
            if (error.message.includes('no pertenece al flujo') || 
                error.message.includes('No se puede saltar etapas')) {
                return res.status(400).json({ error: error.message });
            }
            if (error.message.includes('no encontrada')) {
                return res.status(404).json({ error: error.message });
            }
        }
        
        // Para errores genéricos
        console.error('Error al actualizar la etapa del candidato:', error);
        res.status(500).json({ error: 'Error interno al procesar la solicitud' });
    }
};

export { addCandidate };