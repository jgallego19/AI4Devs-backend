# Prompt 1 (claude-3.7-sonnet)
Eres un experto arquitecto de sistemas con experiencia en ATS y en API REST. Genérame una documentación que incluya la estructura de carpetas, las tecnologías utilizadas, la arquitectura y el contrato del API Rest de @backend.

Hazlo en español y dame la salida en formato markdown, en un nuevo fichero backend.md
___
# Prompt 2 (claude-3.7-sonnet)
Eres un experto en bases de datos. Dame una documentación del modelo de datos que explique campos, relaciones y un diagrama en formato mermaid @prisma
___
# Prompt 3 (claude-3.7-sonnet)
Perfecto. Teniendo en cuenta ahora toda la documentación en @backend.md y también el @modelo_datos.md , quiero generar un nuevo endpoint para obtener todos los candidatos que aplican a una determinada posición. ¿Qué cosas necesito implementar previamente para este objetivo? ¿Tal vez deba implementar primero un endpoint para obtener las posiciones actuales?

No implementes nada todavía, solo explícame qué pasos debería dar para conseguir mi objetivo
___
# Prompt 4 (claude-3.7-sonnet)
Perfecto. Comienza con el servicio de posiciones. Sé coherente con la implementación de otros servicios similares, como @candidateService.ts y aplica las buenas prácticas de clean code y DDD, que conoces bien como experto en ingeniero de software y arquitecto de sofwate con más de 20 años de experiencia en el sector
___
# Prompt 5 (claude-3.7-sonnet)
1. Asegúrate de que el nuevo endpoint (GET /positions/:id/candidates) proporciona la siguiente información básica:
      - Nombre completo del candidato (de la tabla candidate).
      - current_interview_step: en qué fase del proceso está el candidato (de la tabla application).
      - La puntuación media del candidato. Recuerda que cada entrevist (interview) realizada por el candidato tiene un score

2. Actualiza también el @api-spec.yaml documentando el nuevo endpoint
___
# Prompt 6 (claude-3.7-sonnet)
las funciones para obtener los candidatos que aplicado a una posición específica (getCandidatesByPosition) y para crear una nueva aplicación para un candidato a una posición (createApplication) los has implementado en @positionService.ts. Siguiente los principios SOLID y DRY, ¿sería esa su ubicación correcta? ¿No deberían ir en nuevo servicio de nombre, por ejemplo, applicationService.ts?

Si crees que es así, traslada estas funciones a un servicio específico para aplicaciones. No hagas nada más que no sea estrictamente necesario. En caso de hacerlo, avísame antes para decidir
___
# Prompt 7 (claude-3.7-sonnet)
Ahora quiero implementar un nuevo endpoint: PUT /positions/:id/candidates/:id/stage, para modificar la fase actual del proceso de entrevista en la que se encuentra un candidato específico en una posición determinada.

Implementa el nuevo endpoint en el controlador @positionController.ts , añadiendo la funcionalidad necesaria al servicio @applicationService.ts y actualizar las rutas y la documentación en @api-spec.yaml
___
# Prompt 8 (claude-3.7-sonnet)


