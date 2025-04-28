import { Request, Response } from 'express';
import { getPositionCandidates } from '../../../presentation/controllers/positionController';
import * as positionService from '../../../application/services/positionService';

// Mock del servicio
jest.mock('../../../application/services/positionService');

describe('Position Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      params: {},
      query: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getPositionCandidates', () => {
    it('debería obtener candidatos para una posición válida', async () => {
      // Mock de datos
      const positionId = 1;
      const mockCandidates = {
        candidates: [
          {
            id: 1,
            full_name: 'Albert Saelices',
            current_interview_step: {
              id: 2,
              name: 'Technical Interview'
            },
            average_score: 4.5
          }
        ],
        total: 1,
        position: {
          id: positionId,
          title: 'Software Engineer'
        }
      };

      // Configurar mocks
      mockRequest.params = { id: positionId.toString() };
      (positionService.getCandidatesByPositionId as jest.Mock).mockResolvedValue(mockCandidates);

      // Llamar al controlador
      await getPositionCandidates(mockRequest as Request, mockResponse as Response);

      // Verificar que se llamó al servicio con los parámetros correctos
      expect(positionService.getCandidatesByPositionId).toHaveBeenCalledWith(positionId, 1, 20);
      
      // Verificar que la respuesta es correcta
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCandidates);
    });

    it('debería manejar parámetros de paginación', async () => {
      // Mock de datos
      const positionId = 1;
      const page = 2;
      const pageSize = 10;
      
      // Configurar mocks
      mockRequest.params = { id: positionId.toString() };
      mockRequest.query = { page: page.toString(), pageSize: pageSize.toString() };
      (positionService.getCandidatesByPositionId as jest.Mock).mockResolvedValue({
        candidates: [],
        total: 0,
        position: { id: positionId, title: 'Software Engineer' }
      });

      // Llamar al controlador
      await getPositionCandidates(mockRequest as Request, mockResponse as Response);

      // Verificar que se llamó al servicio con los parámetros correctos
      expect(positionService.getCandidatesByPositionId).toHaveBeenCalledWith(positionId, page, pageSize);
    });

    it('debería devolver error 400 para un parámetro page inválido', async () => {
      // Configurar mocks
      mockRequest.params = { id: '1' };
      mockRequest.query = { page: 'invalid' };

      // Llamar al controlador
      await getPositionCandidates(mockRequest as Request, mockResponse as Response);

      // Verificar respuesta de error
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'El parámetro "page" debe ser un número entero positivo'
      });
    });

    it('debería devolver error 400 para un parámetro pageSize inválido', async () => {
      // Configurar mocks
      mockRequest.params = { id: '1' };
      mockRequest.query = { pageSize: '-5' };

      // Llamar al controlador
      await getPositionCandidates(mockRequest as Request, mockResponse as Response);

      // Verificar respuesta de error
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'El parámetro "pageSize" debe ser un número entero positivo'
      });
    });

    it('debería manejar error 404 cuando la posición no existe', async () => {
      // Configurar mocks
      mockRequest.params = { id: '999' };
      (positionService.getCandidatesByPositionId as jest.Mock).mockRejectedValue({
        status: 404,
        message: 'No se encontró la posición con el ID especificado'
      });

      // Llamar al controlador
      await getPositionCandidates(mockRequest as Request, mockResponse as Response);

      // Verificar respuesta de error
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'No se encontró la posición con el ID especificado'
      });
    });

    it('debería manejar error 500 para otros errores', async () => {
      // Configurar mocks
      mockRequest.params = { id: '1' };
      (positionService.getCandidatesByPositionId as jest.Mock).mockRejectedValue(new Error('Error inesperado'));

      // Llamar al controlador
      await getPositionCandidates(mockRequest as Request, mockResponse as Response);

      // Verificar respuesta de error
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error interno del servidor'
      });
    });
  });
}); 