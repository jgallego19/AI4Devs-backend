import { Request, Response } from 'express';
import { getCandidatesByPositionId } from '../../application/services/positionService';

/**
 * Controlador para obtener todos los candidatos de una posición específica
 * @param req Request con el ID de posición como parámetro y posibles parámetros de paginación
 * @param res Response para enviar los datos de los candidatos
 */
export const getPositionCandidates = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 20;
        
        // Validar parámetros de paginación
        if (isNaN(page) || page < 1) {
            return res.status(400).json({ error: 'El parámetro "page" debe ser un número entero positivo' });
        }
        
        if (isNaN(pageSize) || pageSize < 1) {
            return res.status(400).json({ error: 'El parámetro "pageSize" debe ser un número entero positivo' });
        }
        
        // Utilizar el servicio para obtener los candidatos
        const candidates = await getCandidatesByPositionId(Number(id), page, pageSize);
        
        // Enviar respuesta exitosa
        res.status(200).json(candidates);
    } catch (error: any) {
        // Manejar errores según su tipo
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        
        // Para errores no controlados
        console.error('Error en el controlador getPositionCandidates:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}; 