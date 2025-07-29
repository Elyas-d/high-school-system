import { PrismaClient } from '@prisma/client';
import { LinkParentToStudentDTO } from '../types/parent.types';

const prisma = new PrismaClient();

export class ParentService {
  async linkToStudent(dto: LinkParentToStudentDTO) {
    // Create or find ParentStudent link
    const link = await prisma.parentStudent.upsert({
      where: {
        parentId_studentId: {
          parentId: dto.parentId,
          studentId: dto.studentId,
        },
      },
      update: {},
      create: {
        parentId: dto.parentId,
        studentId: dto.studentId,
      },
    });
    return { success: true, link };
  }

  async viewChildGrades(parentId: string) {
    // Find all students for this parent, then fetch grades
    const parent = await prisma.parent.findUnique({
      where: { id: parentId },
      include: {
        students: {
          include: {
            student: {
              include: {
                grades: true,
              },
            },
          },
        },
      },
    });
    if (!parent) throw new Error('Parent not found');
    // Flatten grades
    const grades = parent.students.flatMap((ps) => ps.student.grades);
    return grades;
  }

  async viewChildAttendance(parentId: string) {
    // Find all students for this parent, then fetch attendance
    const parent = await prisma.parent.findUnique({
      where: { id: parentId },
      include: {
        students: {
          include: {
            student: {
              include: {
                attendances: true,
              },
            },
          },
        },
      },
    });
    if (!parent) throw new Error('Parent not found');
    // Flatten attendance
    const attendance = parent.students.flatMap((ps) => ps.student.attendances);
    return attendance;
  }
} 