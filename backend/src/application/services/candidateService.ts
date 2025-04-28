import { Candidate } from '../../domain/models/Candidate';
import { validateCandidateData } from '../validator';
import { Education } from '../../domain/models/Education';
import { WorkExperience } from '../../domain/models/WorkExperience';
import { Resume } from '../../domain/models/Resume';
import { Application } from '../../domain/models/Application';

export const addCandidate = async (candidateData: any) => {
    try {
        validateCandidateData(candidateData); // Validar los datos del candidato
    } catch (error: any) {
        throw new Error(error);
    }

    const candidate = new Candidate(candidateData); // Crear una instancia del modelo Candidate
    try {
        const savedCandidate = await candidate.save(); // Guardar el candidato en la base de datos
        const candidateId = savedCandidate.id; // Obtener el ID del candidato guardado

        // Guardar la educación del candidato
        if (candidateData.educations) {
            for (const education of candidateData.educations) {
                const educationModel = new Education(education);
                educationModel.candidateId = candidateId;
                await educationModel.save();
                candidate.education.push(educationModel);
            }
        }

        // Guardar la experiencia laboral del candidato
        if (candidateData.workExperiences) {
            for (const experience of candidateData.workExperiences) {
                const experienceModel = new WorkExperience(experience);
                experienceModel.candidateId = candidateId;
                await experienceModel.save();
                candidate.workExperience.push(experienceModel);
            }
        }

        // Guardar los archivos de CV
        if (candidateData.cv && Object.keys(candidateData.cv).length > 0) {
            const resumeModel = new Resume(candidateData.cv);
            resumeModel.candidateId = candidateId;
            await resumeModel.save();
            candidate.resumes.push(resumeModel);
        }
        return savedCandidate;
    } catch (error: any) {
        if (error.code === 'P2002') {
            // Unique constraint failed on the fields: (`email`)
            throw new Error('The email already exists in the database');
        } else {
            throw error;
        }
    }
};

export const findCandidateById = async (id: number): Promise<Candidate | null> => {
    try {
        const candidate = await Candidate.findOne(id); // Cambio aquí: pasar directamente el id
        return candidate;
    } catch (error) {
        console.error('Error al buscar el candidato:', error);
        throw new Error('Error al recuperar el candidato');
    }
};

export const getAllCandidates = async (page: number = 1, pageSize: number = 20) => {
    try {
        // Validar parámetros de paginación
        if (isNaN(page) || page <= 0) {
            throw new Error('El parámetro "page" debe ser un número entero positivo');
        }
        
        if (isNaN(pageSize) || pageSize <= 0) {
            throw new Error('El parámetro "pageSize" debe ser un número entero positivo');
        }
        
        // Usar el método del modelo para obtener todos los candidatos
        return await Candidate.findAll(page, pageSize);
    } catch (error: any) {
        console.error('Error al obtener todos los candidatos:', error);
        throw error;
    }
};

/**
 * Actualiza la etapa de entrevista de un candidato
 * @param candidateId ID del candidato
 * @param interviewStepId ID de la nueva etapa de entrevista
 * @returns Información actualizada del candidato con las etapas previa y actual
 */
export const updateCandidateStage = async (candidateId: number, interviewStepId: number) => {
    try {
        // Validar parámetros
        if (isNaN(candidateId) || candidateId <= 0) {
            throw new Error('ID de candidato inválido');
        }
        
        if (isNaN(interviewStepId) || interviewStepId <= 0) {
            throw new Error('ID de etapa de entrevista inválido');
        }
        
        // Buscar la aplicación activa del candidato
        const application = await Application.findByCandidateId(candidateId);
        
        if (!application) {
            throw new Error('El candidato no tiene una aplicación activa');
        }
        
        // Actualizar la etapa de entrevista usando el método del modelo Application
        return await Application.updateInterviewStep(application.id!, interviewStepId);
    } catch (error: any) {
        console.error('Error al actualizar la etapa del candidato:', error);
        throw error;
    }
};
