import { PrismaClient } from '@prisma/client';
import { AssignGradeDTO, UpdateGradeDTO } from '../types/grade.types';

const prisma = new PrismaClient();

export class GradeService {
  async assignGrade(dto: AssignGradeDTO) {
    // Upsert grade for student/class/term
    const grade = await prisma.grade.upsert({
      where: {
        studentId_classId_term: {
          studentId: dto.studentId,
          classId: dto.classId,
          term: dto.term,
        },
      },
      update: { score: dto.score },
      create: {
        studentId: dto.studentId,
        classId: dto.classId,
        term: dto.term,
        score: dto.score,
      },
    });
    return grade;
  }

  async fetchByClass(classId: string) {
    return prisma.grade.findMany({ where: { classId } });
  }

  async fetchByStudent(studentId: string) {
    return prisma.grade.findMany({ where: { studentId } });
  }

  async fetchBySubject(subjectId: string) {
    // Find all classes for subject, then grades for those classes
    const classes = await prisma.class.findMany({ where: { subjectId } });
    const classIds = classes.map((c) => c.id);
    return prisma.grade.findMany({ where: { classId: { in: classIds } } });
  }

  async updateGrade(gradeId: string, dto: UpdateGradeDTO) {
    const grade = await prisma.grade.update({
      where: { id: gradeId },
      data: dto,
    });
    return grade;
  }
} 