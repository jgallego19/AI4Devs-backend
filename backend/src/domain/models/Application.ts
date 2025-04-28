import { PrismaClient } from '@prisma/client';
import { Interview } from './Interview';
import { InterviewStep } from './InterviewStep';

const prisma = new PrismaClient();

export class Application {
    id?: number;
    positionId: number;
    candidateId: number;
    applicationDate: Date;
    currentInterviewStep: number;
    notes?: string;
    interviews: Interview[]; // Added this line
    updatedAt?: Date;

    constructor(data: any) {
        this.id = data.id;
        this.positionId = data.positionId;
        this.candidateId = data.candidateId;
        this.applicationDate = new Date(data.applicationDate);
        this.currentInterviewStep = data.currentInterviewStep;
        this.notes = data.notes;
        this.interviews = data.interviews || []; // Added this line
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : undefined;
    }

    async save() {
        const applicationData: any = {
            positionId: this.positionId,
            candidateId: this.candidateId,
            applicationDate: this.applicationDate,
            currentInterviewStep: this.currentInterviewStep,
            notes: this.notes,
        };

        if (this.id) {
            return await prisma.application.update({
                where: { id: this.id },
                data: applicationData,
            });
        } else {
            return await prisma.application.create({
                data: applicationData,
            });
        }
    }

    static async findOne(id: number): Promise<Application | null> {
        const data = await prisma.application.findUnique({
            where: { id: id },
        });
        if (!data) return null;
        return new Application(data);
    }
    
    /**
     * Actualiza la etapa de entrevista actual de una aplicación
     * @param applicationId ID de la aplicación
     * @param interviewStepId ID de la nueva etapa de entrevista
     * @returns Información actualizada de la aplicación con datos del candidato y las etapas previa y actual
     */
    static async updateInterviewStep(applicationId: number, interviewStepId: number): Promise<{
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
    }> {
        // Validar los parámetros
        if (isNaN(applicationId) || applicationId <= 0) {
            throw new Error('ID de aplicación inválido');
        }
        
        if (isNaN(interviewStepId) || interviewStepId <= 0) {
            throw new Error('ID de etapa de entrevista inválido');
        }
        
        // Obtener la aplicación actual con información de la etapa
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                candidate: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                interviewStep: {
                    select: {
                        id: true,
                        name: true,
                        interviewFlowId: true,
                        orderIndex: true
                    }
                },
                position: {
                    select: {
                        interviewFlowId: true
                    }
                }
            }
        });
        
        if (!application) {
            throw new Error('Aplicación no encontrada');
        }
        
        if (!application.candidate) {
            throw new Error('Candidato no encontrado');
        }
        
        // Obtener la nueva etapa de entrevista
        const newInterviewStep = await prisma.interviewStep.findUnique({
            where: { id: interviewStepId },
            select: {
                id: true,
                name: true,
                interviewFlowId: true,
                orderIndex: true
            }
        });
        
        if (!newInterviewStep) {
            throw new Error('Etapa de entrevista no encontrada');
        }
        
        // Validar que la etapa pertenece al mismo flujo de entrevista
        if (newInterviewStep.interviewFlowId !== application.position.interviewFlowId) {
            throw new Error('La etapa no pertenece al flujo de entrevista de esta posición');
        }
        
        // Validar que no se está saltando una etapa obligatoria (opcional, depende de reglas de negocio)
        // Por ejemplo, asegurar que solo se puede avanzar a la siguiente etapa en orden
        if (application.interviewStep && newInterviewStep.orderIndex > application.interviewStep.orderIndex + 1) {
            throw new Error('No se puede saltar etapas en el flujo de entrevistas');
        }
        
        // Guardar la etapa anterior para incluirla en la respuesta
        const previousStep = application.interviewStep ? {
            id: application.interviewStep.id,
            name: application.interviewStep.name
        } : null;
        
        // Actualizar la etapa con timestamp
        const now = new Date();
        const updatedApplication = await prisma.application.update({
            where: { id: applicationId },
            data: {
                currentInterviewStep: interviewStepId,
                updatedAt: now
            },
            include: {
                candidate: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                interviewStep: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        
        // Formatear la respuesta
        return {
            success: true,
            candidate: {
                id: updatedApplication.candidate.id,
                full_name: `${updatedApplication.candidate.firstName} ${updatedApplication.candidate.lastName}`,
                current_interview_step: {
                    id: updatedApplication.interviewStep.id,
                    name: updatedApplication.interviewStep.name
                },
                updated_at: now.toISOString()
            },
            previous_step: previousStep
        };
    }
    
    /**
     * Encuentra la aplicación activa para un candidato
     * @param candidateId ID del candidato
     * @returns La aplicación activa del candidato o null si no existe
     */
    static async findByCandidateId(candidateId: number): Promise<Application | null> {
        const data = await prisma.application.findFirst({
            where: { 
                candidateId: candidateId,
                // Aquí podrías añadir más condiciones si tienes un campo para indicar si la aplicación está activa
            },
            orderBy: {
                applicationDate: 'desc' // Obtener la aplicación más reciente
            }
        });
        
        if (!data) return null;
        return new Application(data);
    }
}
