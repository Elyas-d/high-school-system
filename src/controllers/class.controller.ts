import { Request, Response } from 'express';
import { ClassService } from '../services/class.service';
import { CreateClassDTO, UpdateClassDTO, AssignTeacherDTO, AssignStudentsDTO } from '../types/class.types';

const classService = new ClassService();

export class ClassController {
  async create(req: Request, res: Response) {
    const dto: CreateClassDTO = req.body;
    const result = await classService.create(dto);
    return res.status(201).json(result);
  }

  async read(req: Request, res: Response) {
    const classId = req.params.id;
    const result = await classService.read(classId);
    return res.json(result);
  }

  async update(req: Request, res: Response) {
    const classId = req.params.id;
    const dto: UpdateClassDTO = req.body;
    const result = await classService.update(classId, dto);
    return res.json(result);
  }

  async delete(req: Request, res: Response) {
    const classId = req.params.id;
    await classService.delete(classId);
    return res.status(204).send();
  }

  async assignTeacher(req: Request, res: Response) {
    const dto: AssignTeacherDTO = req.body;
    const result = await classService.assignTeacher(dto);
    return res.json(result);
  }

  async assignStudents(req: Request, res: Response) {
    const dto: AssignStudentsDTO = req.body;
    const result = await classService.assignStudents(dto);
    return res.json(result);
  }

  async getSchedule(req: Request, res: Response) {
    const classId = req.params.id;
    const result = await classService.getSchedule(classId);
    return res.json(result);
  }
} 