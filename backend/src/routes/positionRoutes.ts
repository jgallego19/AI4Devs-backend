import { Router } from 'express';
import { 
  getPositionsController, 
  getPositionByIdController, 
  createPositionController, 
  updatePositionController,
  getCandidatesByPositionController,
  createApplicationController,
  updateCandidateStageController
} from '../presentation/controllers/positionController';

const router = Router();

// Rutas principales de posiciones
router.get('/', getPositionsController);
router.get('/:id', getPositionByIdController);
router.post('/', createPositionController);
router.put('/:id', updatePositionController);

// Rutas relacionadas con candidatos y aplicaciones
router.get('/:id/candidates', getCandidatesByPositionController);
router.post('/:id/applications', createApplicationController);
router.put('/:id/candidates/:candidateId/stage', updateCandidateStageController);

export default router; 