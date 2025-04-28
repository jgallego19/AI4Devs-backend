# Historia de Usuario: Actualizar Etapa de un Candidato

## Descripción Funcional

### ¿Qué hace?
Este endpoint permite actualizar la etapa actual (current_interview_step) de un candidato específico dentro de un proceso de selección.

### ¿Para qué sirve?
Sirve para mover a un candidato de una etapa a otra en el proceso de selección, facilitando la gestión del flujo de trabajo en una interfaz tipo kanban.

### Contexto de uso
Un reclutador o gerente de contratación necesita actualizar el estado de un candidato después de completar una etapa del proceso (por ejemplo, moverlo de "Entrevista Inicial" a "Entrevista Técnica" o de "Prueba Técnica" a "Oferta").

## Campos de Base de Datos / Modelos Impactados

### Tablas principales
- `Application`: Para actualizar la etapa actual de entrevista (current_interview_step)
- `InterviewStep`: Para validar que la nueva etapa existe y pertenece al flujo correcto
- `Candidate`: Para validar que el candidato existe

### Campos específicos
- `Application.currentInterviewStep`: Campo a actualizar
- `Application.candidateId`: Para identificar la aplicación correcta
- `InterviewStep.id`: Para validar la existencia de la etapa
- `InterviewStep.interviewFlowId`: Para validar que la etapa pertenece al flujo correcto

## Definición de la Estructura de Petición y Respuesta

### Formato JSON de petición

```json
{
  "interview_step_id": 3
}
```

### Formato JSON de respuesta

```json
{
  "success": true,
  "candidate": {
    "id": 1,
    "full_name": "Albert Saelices",
    "current_interview_step": {
      "id": 3,
      "name": "Technical Test"
    },
    "updated_at": "2023-06-15T14:30:45Z"
  },
  "previous_step": {
    "id": 2,
    "name": "Technical Interview"
  }
}
```

## Especificación Técnica

### URL y Método HTTP
- **URL**: `/candidates/:id/stage`
- **Método**: PUT
- **Parámetros de ruta**:
  - `id`: ID del candidato (entero positivo)

### Parámetros de cuerpo (body)
- `interview_step_id`: ID de la nueva etapa de entrevista (entero positivo, obligatorio)

## Implementación

### Componentes a modificar
1. **Rutas**:
   - Crear o modificar endpoint en `/src/routes/candidateRoutes.ts`

2. **Controladores**:
   - Crear nuevo método en `/src/presentation/controllers/candidateController.ts`

3. **Servicios**:
   - Crear método en `/src/application/services/candidateService.ts` para actualizar la etapa

4. **Modelos/Repositorios**:
   - Extender modelo `/src/domain/models/Application.ts` con método para actualizar la etapa

## Requisitos de Seguridad
- Validar que el usuario tiene permisos para modificar la etapa del candidato
- Implementar validación del parámetro ID y interview_step_id para evitar inyección SQL
- Registrar en logs quién realizó el cambio y cuándo (en una fase posterior)

## Requisitos de Performance
- Optimizar la consulta para actualizar solo los campos necesarios
- Implementar transacciones para garantizar la atomicidad de la operación
- Considerar la adición de un timestamp `updated_at` para seguimiento de cambios

## Requisitos de Validación de Negocio
- Verificar que la nueva etapa pertenece al mismo flujo de entrevista que la etapa actual
- Comprobar que no se está saltando una etapa obligatoria según el flujo
- Validar que el candidato tiene una aplicación activa para la posición

## Criterios de Aceptación

1. **El endpoint debe:**
   - Actualizar correctamente la etapa del candidato
   - Devolver la información actualizada del candidato con la nueva etapa
   - Incluir la etapa anterior en la respuesta para referencia

2. **Manejo de casos especiales:**
   - Si el candidato no existe, devolver error 404
   - Si la etapa de entrevista no existe, devolver error 400 con mensaje claro
   - Si la etapa no pertenece al flujo correcto, devolver error 400 con mensaje específico
   - Si el candidato no tiene una aplicación activa, devolver error 404

3. **Validaciones:**
   - El ID del candidato debe ser un número entero positivo
   - El ID de la etapa de entrevista debe ser un número entero positivo y existir en la base de datos

## Documentación

1. **Swagger/OpenAPI:**
   - Actualizar el archivo `api-spec.yaml` con la especificación del nuevo endpoint
   - Incluir esquema del cuerpo de la petición, parámetros, respuestas posibles y ejemplos

2. **Postman:**
   - Crear una nueva request en la colección de Postman del proyecto
   - Incluir ejemplos de uso con diferentes parámetros y casos de prueba

## Testing

1. **Tests Unitarios:**
   - Crear tests para el controlador en `/src/tests/presentation/controllers/candidateController.test.ts`
   - Crear tests para el servicio en `/src/tests/application/services/candidateService.test.ts`
   - Verificar manejo correcto de todos los casos de error

2. **Tests de Integración:**
   - Crear test end-to-end que verifique que el endpoint actualiza correctamente la etapa
   - Probar casos límite: etapas inexistentes, candidatos sin aplicación, etc.

3. **Cobertura mínima:**
   - Asegurar 85% de cobertura para esta funcionalidad
   - Incluir pruebas específicas para las reglas de negocio relacionadas con el flujo de entrevistas 