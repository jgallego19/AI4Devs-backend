# Historia de Usuario: Recuperar Candidatos para una Posición Específica

## Descripción Funcional

### ¿Qué hace?
Este endpoint permite obtener todos los candidatos que están en proceso de selección para una posición específica identificada por su ID.

### ¿Para qué sirve?
Sirve para visualizar el estado actual de los candidatos en una interfaz tipo kanban, permitiendo a los reclutadores y gerentes de contratación hacer un seguimiento del progreso de los candidatos a través del proceso de selección.

### Contexto de uso
Un reclutador o gerente de contratación necesita ver todos los candidatos que están participando en un proceso de selección específico, junto con su estado actual (etapa de entrevista) y su puntuación promedio basada en las entrevistas realizadas hasta el momento.

## Campos de Base de Datos / Modelos Impactados

### Tablas principales
- `Candidate`: Para obtener información básica del candidato (nombre, apellido)
- `Application`: Para obtener la etapa actual de entrevista
- `Interview`: Para calcular la puntuación promedio
- `Position`: Para validar que la posición existe

### Campos específicos
- `Candidate.firstName`
- `Candidate.lastName`
- `Application.currentInterviewStep`
- `Application.positionId`
- `Interview.score`

## Definición de la Estructura de Respuesta

### Formato JSON de respuesta

```json
{
  "candidates": [
    {
      "id": 1,
      "full_name": "Albert Saelices",
      "current_interview_step": {
        "id": 2,
        "name": "Technical Interview"
      },
      "average_score": 4.5
    },
    {
      "id": 2,
      "full_name": "María García",
      "current_interview_step": {
        "id": 1,
        "name": "Initial Screening"
      },
      "average_score": 3.7
    }
  ],
  "total": 2,
  "position": {
    "id": 1,
    "title": "Software Engineer"
  }
}
```

## Especificación Técnica

### URL y Método HTTP
- **URL**: `/positions/:id/candidates`
- **Método**: GET
- **Parámetros de ruta**:
  - `id`: ID de la posición (entero positivo)

### Parámetros de consulta opcionales
- `page`: Número de página (defecto: 1)
- `pageSize`: Tamaño de página (defecto: 20, máximo: 50)

## Implementación

### Componentes a modificar
1. **Rutas**:
   - Crear nuevo endpoint en `/src/routes/positionRoutes.ts`

2. **Controladores**:
   - Crear nuevo método en `/src/presentation/controllers/positionController.ts`

3. **Servicios**:
   - Crear método en `/src/application/services/positionService.ts` para recuperar candidatos por posición

4. **Modelos/Repositorios**:
   - Extender modelo `/src/domain/models/Position.ts` con método para obtener candidatos

## Requisitos de Seguridad
- Implementar validación del parámetro ID para evitar inyección SQL
- No se requiere autenticación para esta fase del proyecto, pero se recomienda preparar el endpoint para futura implementación

## Requisitos de Performance
- Implementar paginación para evitar sobrecarga con grandes volúmenes de datos
- Asegurar que existen índices en `Application.positionId` y `Application.candidateId`
- Optimizar la consulta para el cálculo del promedio de puntuaciones

## Criterios de Aceptación

1. **El endpoint debe devolver:**
   - Lista de candidatos con su nombre completo, etapa actual y puntuación promedio
   - Información de la posición (id y título)
   - Total de candidatos

2. **Manejo de casos especiales:**
   - Si la posición no existe, devolver error 404
   - Si no hay candidatos, devolver array vacío, no error
   - Si un candidato no tiene entrevistas, `average_score` debe ser `null`

3. **Validaciones:**
   - El ID de posición debe ser un número entero positivo
   - La paginación debe funcionar correctamente

## Documentación

1. **Swagger/OpenAPI:**
   - Actualizar el archivo `api-spec.yaml` con la especificación del nuevo endpoint
   - Incluir todos los parámetros, respuestas posibles y ejemplos

2. **Postman:**
   - Crear una nueva request en la colección de Postman del proyecto
   - Incluir ejemplos de uso con diferentes parámetros

## Testing

1. **Tests Unitarios:**
   - Crear tests para el controlador en `/src/tests/presentation/controllers/positionController.test.ts`
   - Crear tests para el servicio en `/src/tests/application/services/positionService.test.ts`

2. **Tests de Integración:**
   - Crear test end-to-end que verifique que el endpoint devuelve datos correctos
   - Probar casos límite: posición sin candidatos, candidatos sin entrevistas

3. **Cobertura mínima:**
   - Asegurar 85% de cobertura para esta funcionalidad 