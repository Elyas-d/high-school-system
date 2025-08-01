import { Request, Response } from 'express';
import { ParentService } from '../services/parent.service';
import { LinkParentToStudentDTO } from '../types/parent.types';

const parentService = new ParentService();

export class ParentController {
  async linkToStudent(req: Request, res: Response) {
    const dto: LinkParentToStudentDTO = req.body;
    const result = await parentService.linkToStudent(dto);
    return res.json(result);
  }

  async viewChildGrades(req: Request, res: Response) {
    const parentId = req.params.id as string;
    const result = await parentService.viewChildGrades(parentId);
    return res.json(result);
  }

  async viewChildAttendance(req: Request, res: Response) {
    const parentId = req.params.id as string;
    const result = await parentService.viewChildAttendance(parentId);
    return res.json(result);
  }
} 