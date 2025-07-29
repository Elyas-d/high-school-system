import { PrismaClient } from '@prisma/client';
import { CreateClassDTO, UpdateClassDTO, AssignTeacherDTO, AssignStudentsDTO } from '../types/class.types';

const prisma = new PrismaClient();

export class ClassService {
  async create(dto: CreateClassDTO) {
    const classObj = await prisma.class.create({
      data: {
        subjectId: dto.subjectId,
        teacherId: dto.teacherId,
        schedule: dto.schedule,
        roomNumber: dto.roomNumber ?? null,
      },
    });
    return classObj;
  }

  async read(classId: string) {
    const classObj = await prisma.class.findUnique({
      where: { id: classId },
      include: { subject: true, teacher: true, students: true },
    });
    if (!classObj) throw new Error('Class not found');
    return classObj;
  }

  async update(classId: string, dto: UpdateClassDTO) {
    const classObj = await prisma.class.update({
      where: { id: classId },
      data: {
        ...dto,
        roomNumber: dto.roomNumber ?? null,
      },
    });
    return classObj;
  }

  async delete(classId: string) {
    await prisma.class.delete({ where: { id: classId } });
    return;
  }

  async assignTeacher(dto: AssignTeacherDTO) {
    const classObj = await prisma.class.update({
      where: { id: dto.classId },
      data: { teacherId: dto.teacherId },
    });
    return { success: true, class: classObj };
  }

  async assignStudents(dto: AssignStudentsDTO) {
    // Set students for the class
    await prisma.student.updateMany({
      where: { classId: dto.classId },
      data: { classId: null }, // Remove from class first
    });
    await prisma.student.updateMany({
      where: { id: { in: dto.studentIds } },
      data: { classId: dto.classId },
    });
    return { success: true };
  }

  async getSchedule(classId: string) {
    const classObj = await prisma.class.findUnique({
      where: { id: classId },
      select: { schedule: true, roomNumber: true },
    });
    if (!classObj) throw new Error('Class not found');
    return classObj;
  }
} 