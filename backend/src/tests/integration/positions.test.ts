import request from 'supertest';
import { app } from '../../index';
import { PrismaClient } from '@prisma/client';
import { Response } from 'supertest';

const prisma = new PrismaClient();

// Datos para pruebas
let testPositionId: number;
let testEmployeeId: number;
const timestamp = Date.now(); // Usar timestamp para hacer los emails únicos

// Configuración antes de las pruebas
beforeAll(async () => {
  // Crear datos de prueba en la base de datos
  try {
    // 1. Crear una empresa
    const company = await prisma.company.create({
      data: {
        name: `Test Company Integration ${timestamp}`
      }
    });

    // 2. Crear un empleado
    const employee = await prisma.employee.create({
      data: {
        companyId: company.id,
        name: 'Test Employee',
        email: `test.employee.${timestamp}@example.com`,
        role: 'HR',
        isActive: true
      }
    });
    
    testEmployeeId = employee.id;

    // 3. Crear un flujo de entrevista
    const interviewFlow = await prisma.interviewFlow.create({
      data: {
        description: 'Test Flow Integration'
      }
    });

    // 4. Crear un tipo de entrevista
    const interviewType = await prisma.interviewType.create({
      data: {
        name: 'Test Type Integration',
        description: 'Test description'
      }
    });

    // 5. Crear etapas de entrevista
    const step1 = await prisma.interviewStep.create({
      data: {
        interviewFlowId: interviewFlow.id,
        interviewTypeId: interviewType.id,
        name: 'Initial Screening Integration',
        orderIndex: 1
      }
    });

    const step2 = await prisma.interviewStep.create({
      data: {
        interviewFlowId: interviewFlow.id,
        interviewTypeId: interviewType.id,
        name: 'Technical Interview Integration',
        orderIndex: 2
      }
    });

    // 6. Crear una posición
    const position = await prisma.position.create({
      data: {
        companyId: company.id,
        interviewFlowId: interviewFlow.id,
        title: 'Test Position Integration',
        description: 'Test position description',
        location: 'Test location',
        jobDescription: 'Test job description',
        status: 'Active',
        isVisible: true
      }
    });

    testPositionId = position.id;

    // 7. Crear candidatos
    const candidate1 = await prisma.candidate.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: `john.doe.${timestamp}@test.com`,
        phone: '123456789'
      }
    });

    const candidate2 = await prisma.candidate.create({
      data: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: `jane.smith.${timestamp}@test.com`,
        phone: '987654321'
      }
    });

    // 8. Crear aplicaciones
    const application1 = await prisma.application.create({
      data: {
        positionId: position.id,
        candidateId: candidate1.id,
        applicationDate: new Date(),
        currentInterviewStep: step1.id
      }
    });

    const application2 = await prisma.application.create({
      data: {
        positionId: position.id,
        candidateId: candidate2.id,
        applicationDate: new Date(),
        currentInterviewStep: step2.id
      }
    });

    // 9. Crear entrevistas con puntuaciones
    await prisma.interview.create({
      data: {
        applicationId: application1.id,
        interviewStepId: step1.id,
        employeeId: employee.id,
        interviewDate: new Date(),
        score: 4,
        notes: 'Good candidate'
      }
    });

    await prisma.interview.create({
      data: {
        applicationId: application2.id,
        interviewStepId: step2.id,
        employeeId: employee.id,
        interviewDate: new Date(),
        score: 5,
        notes: 'Excellent candidate'
      }
    });

  } catch (error) {
    console.error('Error al configurar datos de prueba:', error);
    throw error;
  }
});

// Limpieza después de las pruebas
afterAll(async () => {
  // Eliminar datos de prueba
  try {
    // Eliminar en orden inverso para respetar las relaciones
    await prisma.interview.deleteMany({
      where: {
        application: {
          position: {
            id: testPositionId
          }
        }
      }
    });

    await prisma.application.deleteMany({
      where: {
        position: {
          id: testPositionId
        }
      }
    });

    // Obtener candidatos para eliminar
    const applications = await prisma.application.findMany({
      where: {
        position: {
          id: testPositionId
        }
      },
      select: {
        candidateId: true
      }
    });

    const candidateIds = applications.map(app => app.candidateId);

    // Eliminar candidatos
    if (candidateIds.length > 0) {
      await prisma.candidate.deleteMany({
        where: {
          id: {
            in: candidateIds
          }
        }
      });
    }

    // Obtener position para eliminar
    const position = await prisma.position.findUnique({
      where: {
        id: testPositionId
      },
      select: {
        companyId: true,
        interviewFlowId: true
      }
    });

    if (position) {
      // Eliminar entrevistas del empleado
      await prisma.interview.deleteMany({
        where: {
          employeeId: testEmployeeId
        }
      });
      
      // Eliminar empleado
      await prisma.employee.delete({
        where: {
          id: testEmployeeId
        }
      });

      // Eliminar posición
      await prisma.position.delete({
        where: {
          id: testPositionId
        }
      });

      // Eliminar pasos de entrevista, flujo y tipo
      await prisma.interviewStep.deleteMany({
        where: {
          interviewFlowId: position.interviewFlowId
        }
      });

      await prisma.interviewFlow.delete({
        where: {
          id: position.interviewFlowId
        }
      });

      // Eliminar tipo de entrevista
      const interviewType = await prisma.interviewType.findFirst();
      if (interviewType) {
        await prisma.interviewType.delete({
          where: {
            id: interviewType.id
          }
        });
      }

      // Eliminar empresa
      await prisma.company.delete({
        where: {
          id: position.companyId
        }
      });
    }
  } catch (error) {
    console.error('Error al limpiar datos de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
});

describe('Position API - Integration Tests', () => {
  describe('GET /positions/:id/candidates', () => {
    it('debería devolver los candidatos para una posición existente', async () => {
      const response = await request(app)
        .get(`/positions/${testPositionId}/candidates`)
        .expect('Content-Type', /json/)
        .expect(200);

      // Verificar estructura de la respuesta
      expect(response.body).toHaveProperty('candidates');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('position');
      
      // Verificar que hay candidatos
      expect(response.body.candidates.length).toBeGreaterThan(0);
      
      // Verificar datos de la posición
      expect(response.body.position.id).toBe(testPositionId);
      expect(response.body.position.title).toBe('Test Position Integration');
      
      // Verificar estructura de un candidato
      const candidate = response.body.candidates[0];
      expect(candidate).toHaveProperty('id');
      expect(candidate).toHaveProperty('full_name');
      expect(candidate).toHaveProperty('current_interview_step');
      expect(candidate).toHaveProperty('average_score');
      
      // Verificar estructura de la etapa actual
      expect(candidate.current_interview_step).toHaveProperty('id');
      expect(candidate.current_interview_step).toHaveProperty('name');
    });

    it('debería devolver error 404 para una posición que no existe', async () => {
      await request(app)
        .get('/positions/9999/candidates')
        .expect('Content-Type', /json/)
        .expect(404)
        .then((response: Response) => {
          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toContain('No se encontró la posición');
        });
    });

    it('debería devolver error 400 para un ID de posición inválido', async () => {
      await request(app)
        .get('/positions/invalid/candidates')
        .expect('Content-Type', /json/)
        .expect(400)
        .then((response: Response) => {
          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toContain('ID de posición');
        });
    });

    it('debería soportar paginación', async () => {
      const page = 1;
      const pageSize = 1;
      
      const response = await request(app)
        .get(`/positions/${testPositionId}/candidates?page=${page}&pageSize=${pageSize}`)
        .expect('Content-Type', /json/)
        .expect(200);

      // Verificar que solo hay un candidato en la respuesta
      expect(response.body.candidates.length).toBe(pageSize);
      
      // Pero el total debería ser mayor
      expect(response.body.total).toBeGreaterThanOrEqual(2);
    });
  });
}); 