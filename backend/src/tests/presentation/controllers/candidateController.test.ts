import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { updateCandidateStageController } from '../../../presentation/controllers/candidateController';
import { updateCandidateStage } from '../../../application/services/candidateService';

// Mock del servicio
jest.mock('../../../application/services/candidateService', () => {
    return {
        updateCandidateStage: jest.fn()
    };
});

describe('Pruebas para el controlador de candidatos - updateCandidateStageController', () => {
    // Objetos mock para request y response
    let mockReq: any;
    let mockRes: any;
    
    beforeEach(() => {
        // Reiniciar mocks antes de cada prueba
        jest.clearAllMocks();
        
        // Configurar objetos mock para request y response
        mockReq = {
            params: { id: '1' },
            body: { interview_step_id: 3 }
        };
        
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });
    
    it('debería actualizar correctamente la etapa de un candidato', async () => {
        // Configurar mock del servicio para devolver un resultado exitoso
        const mockResult = {
            success: true,
            candidate: {
                id: 1,
                full_name: 'Juan Pérez',
                current_interview_step: { id: 3, name: 'Prueba Técnica' },
                updated_at: '2023-06-15T14:30:45Z'
            },
            previous_step: { id: 2, name: 'Entrevista Técnica' }
        };
        
        (updateCandidateStage as jest.Mock).mockImplementation(() => Promise.resolve(mockResult));
        
        // Ejecutar el controlador
        await updateCandidateStageController(mockReq, mockRes);
        
        // Verificar que se llamó al servicio con los parámetros correctos
        expect(updateCandidateStage).toHaveBeenCalledWith(1, 3);
        
        // Verificar que se envió la respuesta correcta
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });
    
    it('debería manejar un ID de candidato inválido', async () => {
        // Configurar request con ID inválido
        mockReq.params.id = 'abc';
        
        // Ejecutar el controlador
        await updateCandidateStageController(mockReq, mockRes);
        
        // Verificar respuesta de error
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Formato de ID de candidato inválido' });
        
        // Verificar que no se llamó al servicio
        expect(updateCandidateStage).not.toHaveBeenCalled();
    });
    
    it('debería manejar un ID de etapa de entrevista inválido', async () => {
        // Casos de prueba para ID de etapa inválido
        const testCases = [
            { body: {}, error: 'Debe proporcionar un ID de etapa de entrevista válido' },
            { body: { interview_step_id: null }, error: 'Debe proporcionar un ID de etapa de entrevista válido' },
            { body: { interview_step_id: 'abc' }, error: 'Debe proporcionar un ID de etapa de entrevista válido' }
        ];
        
        for (const testCase of testCases) {
            // Configurar request con parámetros de prueba
            mockReq.body = testCase.body;
            
            // Ejecutar el controlador
            await updateCandidateStageController(mockReq, mockRes);
            
            // Verificar respuesta de error
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ error: testCase.error });
            
            // Verificar que no se llamó al servicio
            expect(updateCandidateStage).not.toHaveBeenCalled();
            
            // Reiniciar mocks para la siguiente iteración
            jest.clearAllMocks();
            
            // Reconfigurar respuesta para la siguiente iteración
            mockRes.status = jest.fn().mockReturnThis();
            mockRes.json = jest.fn();
        }
    });
    
    it('debería manejar error de candidato sin aplicación activa', async () => {
        // Configurar mock del servicio para lanzar un error específico
        const error = new Error('El candidato no tiene una aplicación activa');
        (updateCandidateStage as jest.Mock).mockImplementation(() => Promise.reject(error));
        
        // Ejecutar el controlador
        await updateCandidateStageController(mockReq, mockRes);
        
        // Verificar respuesta de error
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'El candidato no tiene una aplicación activa' });
    });
    
    it('debería manejar error de etapa no perteneciente al flujo', async () => {
        // Configurar mock del servicio para lanzar un error específico
        const error = new Error('La etapa no pertenece al flujo de entrevista de esta posición');
        (updateCandidateStage as jest.Mock).mockImplementation(() => Promise.reject(error));
        
        // Ejecutar el controlador
        await updateCandidateStageController(mockReq, mockRes);
        
        // Verificar respuesta de error
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ 
            error: 'La etapa no pertenece al flujo de entrevista de esta posición' 
        });
    });
    
    it('debería manejar error de no se puede saltar etapas', async () => {
        // Configurar mock del servicio para lanzar un error específico
        const error = new Error('No se puede saltar etapas en el flujo de entrevistas');
        (updateCandidateStage as jest.Mock).mockImplementation(() => Promise.reject(error));
        
        // Ejecutar el controlador
        await updateCandidateStageController(mockReq, mockRes);
        
        // Verificar respuesta de error
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ 
            error: 'No se puede saltar etapas en el flujo de entrevistas' 
        });
    });
    
    it('debería manejar errores genéricos', async () => {
        // Configurar mock del servicio para lanzar un error genérico
        const error = new Error('Error inesperado');
        (updateCandidateStage as jest.Mock).mockImplementation(() => Promise.reject(error));
        
        // Ejecutar el controlador
        await updateCandidateStageController(mockReq, mockRes);
        
        // Verificar respuesta de error genérico
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Error interno al procesar la solicitud' });
    });
}); 