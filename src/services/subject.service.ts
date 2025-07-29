import { PrismaClient } from '@prisma/client';
import { CreateSubjectDTO, UpdateSubjectDTO, AssignToGradeLevelDTO } from '../types/subject.types';

const prisma = new PrismaClient();

export class SubjectService {
  async create(dto: CreateSubjectDTO) {
    const subject = await prisma.subject.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        gradeLevelId: dto.gradeLevelId,
      },
    });
    return subject;
  }

  async read(subjectId: string) {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: { gradeLevel: true },
    });
    if (!subject) throw new Error('Subject not found');
    return subject;
  }

  async update(subjectId: string, dto: UpdateSubjectDTO) {
    const subject = await prisma.subject.update({
      where: { id: subjectId },
      data: dto,
    });
    return subject;
  }

  async delete(subjectId: string) {
    await prisma.subject.delete({ where: { id: subjectId } });
    return;
  }

  async assignToGradeLevel(dto: AssignToGradeLevelDTO) {
    const subject = await prisma.subject.update({
      where: { id: dto.subjectId },
      data: { gradeLevelId: dto.gradeLevelId },
    });
    return { success: true, subject };
  }
} 