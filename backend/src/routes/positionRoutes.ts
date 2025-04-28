import { Router } from 'express';
import { getPositionCandidates } from '../presentation/controllers/positionController';

const router = Router();

/**
 * @route GET /positions/:id/candidates
 * @description Obtiene todos los candidatos para una posición específica
 * @param {number} id - ID de la posición
 * @param {number} [page=1] - Número de página (opcional)
 * @param {number} [pageSize=20] - Tamaño de página (opcional, máximo 50)
 * @returns {object} Lista de candidatos con su etapa actual y puntuación promedio
 */
router.get('/:id/candidates', getPositionCandidates);

export default router; 