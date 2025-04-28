import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { updateCandidateStage } from '../../../application/services/candidateService';
import { Application } from '../../../domain/models/Application';

// Definición de tipo para Application
type MockApplication = {
    id?: number;
    candidateId: number;
    positionId: number;
};

// Definición de tipo para resultado de updateInterviewStep
type UpdateResult = {
    success: boolean;
    candidate: {
        id: number;
        full_name: string;
        current_interview_step: {
            id: number;
            name: string;
        };
        updated_at: string;
    };
    previous_step: {
        id: number;
        name: string;
    } | null;
};

// Mock de Application
jest.mock('../../../domain/models/Application', () => {
    return {
        Application: {
            findByCandidateId: jest.fn(),
            updateInterviewStep: jest.fn()
        }
    };
});

describe('Pruebas para el servicio de candidatos - updateCandidateStage', () => {
    beforeEach(() => {
        // Limpiamos los mocks antes de cada prueba
        jest.clearAllMocks();
    });

    it('debería actualizar correctamente la etapa de un candidato', async () => {
        // Configuramos los mocks para simular un candidato con aplicación
        const mockApplication: MockApplication = { id: 1, candidateId: 1, positionId: 1 };
        const mockUpdateResult: UpdateResult = {
            success: true,
            candidate: {
                id: 1,
                full_name: 'Juan Pérez',
                current_interview_step: { id: 3, name: 'Prueba Técnica' },
                updated_at: '2023-06-15T14:30:45Z'
            },
            previous_step: { id: 2, name: 'Entrevista Técnica' }
        };

        // Usamos cualquier() para evitar errores de tipo
        (Application.findByCandidateId as jest.Mock).mockImplementation(() => Promise.resolve(mockApplication));
        (Application.updateInterviewStep as jest.Mock).mockImplementation(() => Promise.resolve(mockUpdateResult));

        // Ejecutamos el servicio
        const result = await updateCandidateStage(1, 3);

        // Verificamos que se llamaron los métodos correctos
        expect(Application.findByCandidateId).toHaveBeenCalledWith(1);
        expect(Application.updateInterviewStep).toHaveBeenCalledWith(1, 3);

        // Verificamos que el resultado es el esperado
        expect(result).toEqual(mockUpdateResult);
    });

    it('debería lanzar un error si el candidato no tiene aplicación activa', async () => {
        // Configuramos el mock para simular un candidato sin aplicación
        (Application.findByCandidateId as jest.Mock).mockImplementation(() => Promise.resolve(null));

        // Verificamos que se lance un error
        await expect(updateCandidateStage(1, 3)).rejects.toThrow('El candidato no tiene una aplicación activa');

        // Verificamos que se llamó el método correcto
        expect(Application.findByCandidateId).toHaveBeenCalledWith(1);
        expect(Application.updateInterviewStep).not.toHaveBeenCalled();
    });

    it('debería validar correctamente el ID del candidato', async () => {
        // Verificamos que se lance un error para IDs inválidos
        await expect(updateCandidateStage(NaN, 3)).rejects.toThrow('ID de candidato inválido');
        await expect(updateCandidateStage(0, 3)).rejects.toThrow('ID de candidato inválido');
        await expect(updateCandidateStage(-1, 3)).rejects.toThrow('ID de candidato inválido');

        // Verificamos que no se llamaron los métodos de Application
        expect(Application.findByCandidateId).not.toHaveBeenCalled();
        expect(Application.updateInterviewStep).not.toHaveBeenCalled();
    });

    it('debería validar correctamente el ID de la etapa de entrevista', async () => {
        // Verificamos que se lance un error para IDs de etapa inválidos
        await expect(updateCandidateStage(1, NaN)).rejects.toThrow('ID de etapa de entrevista inválido');
        await expect(updateCandidateStage(1, 0)).rejects.toThrow('ID de etapa de entrevista inválido');
        await expect(updateCandidateStage(1, -1)).rejects.toThrow('ID de etapa de entrevista inválido');

        // Verificamos que no se llamaron los métodos de Application
        expect(Application.findByCandidateId).not.toHaveBeenCalled();
        expect(Application.updateInterviewStep).not.toHaveBeenCalled();
    });

    it('debería propagar errores del método updateInterviewStep', async () => {
        // Configuramos los mocks
        const mockApplication: MockApplication = { id: 1, candidateId: 1, positionId: 1 };
        const mockError = new Error('La etapa no pertenece al flujo de entrevista de esta posición');

        (Application.findByCandidateId as jest.Mock).mockImplementation(() => Promise.resolve(mockApplication));
        (Application.updateInterviewStep as jest.Mock).mockImplementation(() => Promise.reject(mockError));

        // Verificamos que se propague el error
        await expect(updateCandidateStage(1, 3)).rejects.toThrow(mockError);

        // Verificamos que se llamaron los métodos correctos
        expect(Application.findByCandidateId).toHaveBeenCalledWith(1);
        expect(Application.updateInterviewStep).toHaveBeenCalledWith(1, 3);
    });
}); 