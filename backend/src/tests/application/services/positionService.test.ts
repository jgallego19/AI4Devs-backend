import { getCandidatesByPositionId } from '../../../application/services/positionService';
import { Position } from '../../../domain/models/Position';

// Mock del modelo Position
jest.mock('../../../domain/models/Position');

describe('Position Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCandidatesByPositionId', () => {
    it('debería llamar a Position.getCandidates con los parámetros correctos', async () => {
      // Configurar mock
      const positionId = 1;
      const page = 2;
      const pageSize = 10;
      const expectedResult = {
        candidates: [],
        total: 0,
        position: { id: positionId, title: 'Test Position' }
      };
      
      // Simular la respuesta del método getCandidates
      (Position.getCandidates as jest.Mock).mockResolvedValue(expectedResult);
      
      // Llamar al servicio
      const result = await getCandidatesByPositionId(positionId, page, pageSize);
      
      // Verificar que el método del modelo fue llamado con los parámetros correctos
      expect(Position.getCandidates).toHaveBeenCalledWith(positionId, page, pageSize);
      
      // Verificar que el resultado es el esperado
      expect(result).toEqual(expectedResult);
    });

    it('debería relanzar un error 404 cuando la posición no existe', async () => {
      // Configurar mock para simular que no se encuentra la posición
      (Position.getCandidates as jest.Mock).mockRejectedValue(new Error('Posición no encontrada'));
      
      // Verificar que el servicio relanza el error con status 404
      await expect(getCandidatesByPositionId(999)).rejects.toEqual({
        status: 404,
        message: 'No se encontró la posición con el ID especificado'
      });
    });

    it('debería relanzar un error 400 para un ID de posición inválido', async () => {
      // Configurar mock para simular un ID inválido
      (Position.getCandidates as jest.Mock).mockRejectedValue(new Error('ID de posición inválido'));
      
      // Verificar que el servicio relanza el error con status 400
      await expect(getCandidatesByPositionId(NaN)).rejects.toEqual({
        status: 400,
        message: 'El ID de posición debe ser un número entero positivo'
      });
    });

    it('debería relanzar un error 500 para errores inesperados', async () => {
      // Configurar mock para simular un error inesperado
      (Position.getCandidates as jest.Mock).mockRejectedValue(new Error('Error inesperado'));
      
      // Verificar que el servicio relanza el error con status 500
      await expect(getCandidatesByPositionId(1)).rejects.toEqual({
        status: 500,
        message: 'Error interno al procesar la solicitud'
      });
    });
  });
}); 