import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class Position {
    id?: number;
    companyId: number;
    interviewFlowId: number;
    title: string;
    description: string;
    status: string;
    isVisible: boolean;
    location: string;
    jobDescription: string;
    requirements?: string;
    responsibilities?: string;
    salaryMin?: number;
    salaryMax?: number;
    employmentType?: string;
    benefits?: string;
    companyDescription?: string;
    applicationDeadline?: Date;
    contactInfo?: string;

    constructor(data: any) {
        this.id = data.id;
        this.companyId = data.companyId;
        this.interviewFlowId = data.interviewFlowId;
        this.title = data.title;
        this.description = data.description;
        this.status = data.status ?? 'Draft';
        this.isVisible = data.isVisible ?? false;
        this.location = data.location;
        this.jobDescription = data.jobDescription;
        this.requirements = data.requirements;
        this.responsibilities = data.responsibilities;
        this.salaryMin = data.salaryMin;
        this.salaryMax = data.salaryMax;
        this.employmentType = data.employmentType;
        this.benefits = data.benefits;
        this.companyDescription = data.companyDescription;
        this.applicationDeadline = data.applicationDeadline ? new Date(data.applicationDeadline) : undefined;
        this.contactInfo = data.contactInfo;
    }

    async save() {
        const positionData: any = {
            companyId: this.companyId,
            interviewFlowId: this.interviewFlowId,
            title: this.title,
            description: this.description,
            status: this.status,
            isVisible: this.isVisible,
            location: this.location,
            jobDescription: this.jobDescription,
            requirements: this.requirements,
            responsibilities: this.responsibilities,
            salaryMin: this.salaryMin,
            salaryMax: this.salaryMax,
            employmentType: this.employmentType,
            benefits: this.benefits,
            companyDescription: this.companyDescription,
            applicationDeadline: this.applicationDeadline,
            contactInfo: this.contactInfo,
        };

        if (this.id) {
            return await prisma.position.update({
                where: { id: this.id },
                data: positionData,
            });
        } else {
            return await prisma.position.create({
                data: positionData,
            });
        }
    }

    static async findOne(id: number): Promise<Position | null> {
        const data = await prisma.position.findUnique({
            where: { id: id },
        });
        if (!data) return null;
        return new Position(data);
    }
    
    /**
     * Recupera todos los candidatos para una posición específica con información sobre su etapa actual y puntuación promedio
     * @param positionId ID de la posición
     * @param page Número de página (empezando desde 1)
     * @param pageSize Tamaño de página (máximo 50)
     * @returns Lista de candidatos con información de etapa y puntuación promedio
     */
    static async getCandidates(positionId: number, page: number = 1, pageSize: number = 20): Promise<{
        candidates: Array<{
            id: number;
            full_name: string;
            current_interview_step: {
                id: number;
                name: string;
            };
            average_score: number | null;
        }>;
        total: number;
        position: {
            id: number;
            title: string;
        };
    }> {
        // Validar parámetros
        if (isNaN(positionId) || positionId <= 0) {
            throw new Error('ID de posición inválido');
        }
        
        // Limitar pageSize a un máximo de 50
        const limitPageSize = Math.min(Math.max(1, pageSize), 50);
        const skip = (Math.max(1, page) - 1) * limitPageSize;
        
        // Verificar que la posición existe
        const position = await prisma.position.findUnique({
            where: { id: positionId },
            select: { id: true, title: true }
        });
        
        if (!position) {
            throw new Error('Posición no encontrada');
        }
        
        // Consultar aplicaciones para esta posición con información de candidatos y etapas
        const applications = await prisma.application.findMany({
            where: {
                positionId: positionId
            },
            select: {
                candidateId: true,
                currentInterviewStep: true,
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
            },
            skip,
            take: limitPageSize
        });
        
        // Contar el total de aplicaciones para esta posición
        const totalCount = await prisma.application.count({
            where: {
                positionId: positionId
            }
        });
        
        // Obtener todos los candidateIds de las aplicaciones
        const candidateIds = applications.map(app => app.candidateId);
        
        // Obtener puntuaciones promedio para todos estos candidatos en esta posición
        const scoresPromise = prisma.interview.groupBy({
            by: ['applicationId'],
            where: {
                application: {
                    positionId: positionId,
                    candidateId: {
                        in: candidateIds
                    }
                }
            },
            _avg: {
                score: true
            }
        });
        
        // Mapear los resultados a aplicaciones con sus IDs
        const applicationsWithIdsPromise = prisma.application.findMany({
            where: {
                positionId: positionId,
                candidateId: {
                    in: candidateIds
                }
            },
            select: {
                id: true,
                candidateId: true
            }
        });
        
        // Esperar a que se completen ambas consultas
        const [scores, applicationsWithIds] = await Promise.all([scoresPromise, applicationsWithIdsPromise]);
        
        // Crear un mapa para buscar rápidamente la puntuación promedio por candidateId
        const scoreByApplicationId = new Map();
        scores.forEach(score => {
            scoreByApplicationId.set(score.applicationId, score._avg.score);
        });
        
        // Crear un mapa para buscar rápidamente el applicationId por candidateId
        const applicationIdByCandidateId = new Map();
        applicationsWithIds.forEach(app => {
            applicationIdByCandidateId.set(app.candidateId, app.id);
        });
        
        // Formatear resultados
        const candidates = applications.map(app => {
            const applicationId = applicationIdByCandidateId.get(app.candidateId);
            const averageScore = applicationId ? scoreByApplicationId.get(applicationId) : null;
            
            return {
                id: app.candidate.id,
                full_name: `${app.candidate.firstName} ${app.candidate.lastName}`,
                current_interview_step: {
                    id: app.interviewStep.id,
                    name: app.interviewStep.name
                },
                average_score: averageScore
            };
        });
        
        return {
            candidates,
            total: totalCount,
            position: {
                id: position.id,
                title: position.title
            }
        };
    }
}

