import { Request, Response } from 'express';
import { GradeService } from '../services/grade.service';
import { AssignGradeDTO, UpdateGradeDTO } from '../types/grade.types';

const gradeService = new GradeService();

export class GradeController {
  async assignGrade(req: Request, res: Response) {
    const dto: AssignGradeDTO = req.body;
    const result = await gradeService.assignGrade(dto);
    return res.status(201).json(result);
  }

  async fetchByClass(req: Request, res: Response) {
    const classId = req.params.classId;
    const result = await gradeService.fetchByClass(classId);
    return res.json(result);
  }

  async fetchByStudent(req: Request, res: Response) {
    const studentId = req.params.studentId;
    const result = await gradeService.fetchByStudent(studentId);
    return res.json(result);
  }

  async fetchBySubject(req: Request, res: Response) {
    const subjectId = req.params.subjectId;
    const result = await gradeService.fetchBySubject(subjectId);
    return res.json(result);
  }

  async updateGrade(req: Request, res: Response) {
    const gradeId = req.params.id;
    const dto: UpdateGradeDTO = req.body;
    const result = await gradeService.updateGrade(gradeId, dto);
    return res.json(result);
  }
} 