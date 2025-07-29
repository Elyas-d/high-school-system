import { PrismaClient, UserRole } from '@prisma/client';
import { AssignSubjectsAndClassesDTO, CreateTeacherDTO, UpdateTeacherDTO } from '../types/teacher.types';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class TeacherService {
  async assignSubjectsAndClasses(dto: AssignSubjectsAndClassesDTO) {
    // Assign subjects: update teacher's classes and subjects
    // For simplicity, assign classes (subjects are linked via class.subjectId)
    const teacher = await prisma.teacher.update({
      where: { id: dto.teacherId },
      data: {
        classes: {
          set: [], // Remove all
          connect: dto.classIds.map((id) => ({ id })),
        },
      },
    });
    // Optionally, you could update classes' teacherId as well
    await prisma.class.updateMany({
      where: { id: { in: dto.classIds } },
      data: { teacherId: dto.teacherId },
    });
    return { success: true };
  }

  async listAssignedClasses(teacherId: string) {
    const classes = await prisma.class.findMany({
      where: { teacherId },
      include: { subject: true },
    });
    return classes;
  }

  async create(dto: CreateTeacherDTO) {
    // Create user with TEACHER role, then teacher
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: hashedPassword,
        role: UserRole.TEACHER,
        phoneNumber: dto.phoneNumber ?? null,
      },
    });
    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
      },
    });
    return { ...teacher, user };
  }

  async read(teacherId: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true, classes: true },
    });
    if (!teacher) throw new Error('Teacher not found');
    return teacher;
  }

  async update(teacherId: string, dto: UpdateTeacherDTO) {
    // Update user info
    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher) throw new Error('Teacher not found');
    const userUpdate: any = { ...dto };
    if (dto.password) {
      userUpdate.password = await bcrypt.hash(dto.password, 10);
    }
    await prisma.user.update({
      where: { id: teacher.userId },
      data: userUpdate,
    });
    return this.read(teacherId);
  }

  async delete(teacherId: string) {
    // Delete teacher and user
    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher) throw new Error('Teacher not found');
    await prisma.teacher.delete({ where: { id: teacherId } });
    await prisma.user.delete({ where: { id: teacher.userId } });
    return;
  }
} 