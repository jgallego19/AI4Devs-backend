import { Position } from '../../domain/models/Position';
import { Candidate } from '../../domain/models/Candidate';
import { Application } from '../../domain/models/Application';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Obtiene los candidatos que han aplicado a una posición específica
 * incluyendo información sobre su fase en el proceso y puntuación media
 * @param positionId ID de la posición
 * @returns Lista de candidatos con información ampliada
 */
export const getCandidatesByPosition = async (positionId: number): Promise<any[]> => {
  try {
    // Verificar que la posición existe
    const position = await Position.findOne(positionId);
    if (!position) {
      throw new Error('La posición no existe');
    }
    
    // Obtener aplicaciones con sus candidatos y entrevistas relacionadas
    const applications = await prisma.application.findMany({
      where: {
        positionId: positionId
      },
      include: {
        candidate: {
          include: {
            educations: true,
            workExperiences: true,
            resumes: true
          }
        },
        interviewStep: true,
        interviews: {
          select: {
            score: true
          }
        }
      }
    });
    
    // Construir respuesta con la información solicitada
    const candidatesInfo = applications.map((app: any) => {
      // Calcular puntuación media de las entrevistas
      const scores = app.interviews
        .map((interview: any) => interview.score)
        .filter((score: any) => score !== null && score !== undefined) as number[];
      
      const averageScore = scores.length > 0
        ? scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length
        : null;
      
      return {
        candidateId: app.candidate.id,
        fullName: `${app.candidate.firstName} ${app.candidate.lastName}`,
        email: app.candidate.email,
        currentInterviewStep: {
          id: app.interviewStep.id,
          name: app.interviewStep.name,
          orderIndex: app.interviewStep.orderIndex
        },
        averageScore: averageScore !== null ? Number(averageScore.toFixed(1)) : null,
        applicationDate: app.applicationDate,
        // Incluir información adicional del candidato según sea necesario
        candidate: app.candidate
      };
    });
    
    return candidatesInfo;
  } catch (error) {
    console.error('Error al obtener candidatos por posición:', error);
    throw error;
  }
};

/**
 * Crea una nueva aplicación para un candidato a una posición
 * @param applicationData Datos de la aplicación
 * @returns Aplicación creada
 */
export const createApplication = async (applicationData: {
  positionId: number;
  candidateId: number;
  currentInterviewStep: number;
  notes?: string;
}): Promise<Application> => {
  try {
    // Verificar que la posición existe
    const position = await Position.findOne(applicationData.positionId);
    if (!position) {
      throw new Error('La posición no existe');
    }
    
    // Crear la aplicación con la fecha actual
    const application = new Application({
      ...applicationData,
      applicationDate: new Date()
    });
    
    return await application.save();
  } catch (error) {
    console.error('Error al crear la aplicación:', error);
    throw error;
  }
};

/**
 * Actualiza la etapa de entrevista de un candidato en una posición específica
 * @param positionId ID de la posición
 * @param candidateId ID del candidato
 * @param stageId ID de la nueva etapa de entrevista
 * @param notes Notas opcionales sobre el cambio de etapa
 * @returns La aplicación actualizada con la nueva etapa
 */
export const updateCandidateStage = async (
  positionId: number,
  candidateId: number,
  stageId: number,
  notes?: string
): Promise<any> => {
  try {
    // Verificar que la posición existe
    const position = await Position.findOne(positionId);
    if (!position) {
      throw new Error('La posición no existe');
    }

    // Verificar que el candidato existe
    const candidate = await Candidate.findOne(candidateId);
    if (!candidate) {
      throw new Error('El candidato no existe');
    }

    // Verificar que la etapa de entrevista existe
    const interviewStep = await prisma.interviewStep.findUnique({
      where: { id: stageId }
    });
    if (!interviewStep) {
      throw new Error('La etapa de entrevista no existe');
    }

    // Buscar la aplicación específica
    const application = await prisma.application.findFirst({
      where: {
        positionId: positionId,
        candidateId: candidateId
      },
      include: {
        interviewStep: true
      }
    });

    if (!application) {
      throw new Error('No existe una aplicación para este candidato en esta posición');
    }

    // Actualizar la etapa
    const updatedApplication = await prisma.application.update({
      where: { id: application.id },
      data: {
        currentInterviewStep: stageId,
        notes: notes !== undefined ? notes : application.notes
      },
      include: {
        interviewStep: true,
        candidate: true,
        position: true
      }
    });

    return {
      id: updatedApplication.id,
      candidateId: updatedApplication.candidateId,
      candidateName: `${updatedApplication.candidate.firstName} ${updatedApplication.candidate.lastName}`,
      positionId: updatedApplication.positionId,
      positionTitle: updatedApplication.position.title,
      previousStage: {
        id: application.interviewStep.id,
        name: application.interviewStep.name
      },
      currentStage: {
        id: updatedApplication.interviewStep.id,
        name: updatedApplication.interviewStep.name
      },
      applicationDate: updatedApplication.applicationDate,
      notes: updatedApplication.notes
    };
  } catch (error) {
    console.error('Error al actualizar la etapa del candidato:', error);
    throw error;
  }
}; 