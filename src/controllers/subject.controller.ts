import { Request, Response } from 'express';
import { SubjectService } from '../services/subject.service';
import { CreateSubjectDTO, UpdateSubjectDTO, AssignToGradeLevelDTO } from '../types/subject.types';

const subjectService = new SubjectService();

export class SubjectController {
  async create(req: Request, res: Response) {
    const dto: CreateSubjectDTO = req.body;
    const result = await subjectService.create(dto);
    return res.status(201).json(result);
  }

  async read(req: Request, res: Response) {
    const subjectId = req.params.id as string;
    const result = await subjectService.read(subjectId);
    return res.json(result);
  }

  async update(req: Request, res: Response) {
    const subjectId = req.params.id as string;
    const dto: UpdateSubjectDTO = req.body;
    const result = await subjectService.update(subjectId, dto);
    return res.json(result);
  }

  async delete(req: Request, res: Response) {
    const subjectId = req.params.id as string;
    await subjectService.delete(subjectId);
    return res.status(204).send();
  }

  async assignToGradeLevel(req: Request, res: Response) {
    const dto: AssignToGradeLevelDTO = req.body;
    const result = await subjectService.assignToGradeLevel(dto);
    return res.json(result);
  }

  // List subjects
  async listAll(_req: Request, res: Response) {
    const result = await subjectService.listAll();
    return res.json(result);
  }
} 