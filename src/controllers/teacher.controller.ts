import { Request, Response } from 'express';
import { TeacherService } from '../services/teacher.service';
import { AssignSubjectsAndClassesDTO, CreateTeacherDTO, UpdateTeacherDTO } from '../types/teacher.types';

const teacherService = new TeacherService();

export class TeacherController {
  async assignSubjectsAndClasses(req: Request, res: Response) {
    const dto: AssignSubjectsAndClassesDTO = req.body;
    const result = await teacherService.assignSubjectsAndClasses(dto);
    return res.json(result);
  }

  async listAssignedClasses(req: Request, res: Response) {
    const teacherId = req.params.id as string;
    const result = await teacherService.listAssignedClasses(teacherId);
    return res.json(result);
  }

  async create(req: Request, res: Response) {
    const dto: CreateTeacherDTO = req.body;
    const result = await teacherService.create(dto);
    return res.status(201).json(result);
  }

  async read(req: Request, res: Response) {
    const teacherId = req.params.id as string;
    const result = await teacherService.read(teacherId);
    return res.json(result);
  }

  async update(req: Request, res: Response) {
    const teacherId = req.params.id as string;
    const dto: UpdateTeacherDTO = req.body;
    const result = await teacherService.update(teacherId, dto);
    return res.json(result);
  }

  async delete(req: Request, res: Response) {
    const teacherId = req.params.id as string;
    await teacherService.delete(teacherId);
    return res.status(204).send();
  }

  // List all teachers
  async list(_req: Request, res: Response) {
    const result = await teacherService.list();
    return res.json(result);
  }
} 