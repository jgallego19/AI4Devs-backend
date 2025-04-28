import { Router } from 'express';
import { 
    addCandidateController, 
    getCandidateById, 
    getAllCandidatesController,
    updateCandidateStageController
} from '../presentation/controllers/candidateController';

const router = Router();

/**
 * @route POST /candidates
 * @desc Añade un nuevo candidato
 */
router.post('/', addCandidateController);

/**
 * @route GET /candidates/:id
 * @desc Obtiene un candidato por su ID
 */
router.get('/:id', getCandidateById);

/**
 * @route GET /candidates
 * @desc Obtiene todos los candidatos con paginación
 * @param {number} [page=1] - Número de página (opcional)
 * @param {number} [pageSize=20] - Tamaño de página (opcional, máximo 50)
 * @returns Lista de candidatos y metadatos de paginación
 */
router.get('/', getAllCandidatesController);

/**
 * @route PUT /candidates/:id/stage
 * @desc Actualiza la etapa de entrevista actual de un candidato
 * @param {number} id - ID del candidato
 * @body {number} interview_step_id - ID de la nueva etapa de entrevista
 * @returns Información actualizada del candidato con las etapas previa y actual
 */
router.put('/:id/stage', updateCandidateStageController);

export default router;
