import prisma from '../../config/database';
import { UserRole } from '@prisma/client';

export interface CreateStudentData {
  userId: string;
  gradeLevelId: string;
  classId?: string;
}

export interface UpdateStudentData {
  gradeLevelId?: string;
  classId?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  gradeLevelId?: string;
  classId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class StudentService {
  /**
   * Get all students with pagination and filtering
   */
  async getAllStudents(options: PaginationOptions = {}): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 10, search = '', gradeLevelId, classId } = options;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.user = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    if (gradeLevelId) {
      where.gradeLevelId = gradeLevelId;
    }

    if (classId) {
      where.classId = classId;
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              role: true,
            },
          },
          gradeLevel: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          class: {
            select: {
              id: true,
              subject: {
                select: {
                  id: true,
                  name: true,
                },
              },
              teacher: {
                select: {
                  id: true,
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
              schedule: true,
              roomNumber: true,
            },
          },
          parents: {
            include: {
              parent: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          user: {
            firstName: 'asc',
          },
        },
      }),
      prisma.student.count({ where }),
    ]);

    return {
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get student by ID
   */
  async getStudentById(id: string): Promise<any> {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        gradeLevel: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        class: {
          select: {
            id: true,
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
            teacher: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            schedule: true,
            roomNumber: true,
          },
        },
        grades: {
          include: {
            class: {
              select: {
                id: true,
                subject: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            term: 'desc',
          },
        },
        attendances: {
          include: {
            class: {
              select: {
                id: true,
                subject: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            date: 'desc',
          },
          take: 10, // Last 10 attendance records
        },
        submissions: {
          include: {
            material: {
              select: {
                id: true,
                title: true,
                subject: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            submissionDate: 'desc',
          },
        },
        parents: {
          include: {
            parent: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phoneNumber: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    return student;
  }

  /**
   * Create a new student
   */
  async createStudent(studentData: CreateStudentData): Promise<any> {
    // Check if user exists and is a student
    const user = await prisma.user.findUnique({
      where: { id: studentData.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== UserRole.STUDENT) {
      throw new Error('User must have STUDENT role');
    }

    // Check if student already exists for this user
    const existingStudent = await prisma.student.findUnique({
      where: { userId: studentData.userId },
    });

    if (existingStudent) {
      throw new Error('Student already exists for this user');
    }

    // Check if grade level exists
    const gradeLevel = await prisma.gradeLevel.findUnique({
      where: { id: studentData.gradeLevelId },
    });

    if (!gradeLevel) {
      throw new Error('Grade level not found');
    }

    // Check if class exists (if provided)
    if (studentData.classId) {
      const classExists = await prisma.class.findUnique({
        where: { id: studentData.classId },
      });

      if (!classExists) {
        throw new Error('Class not found');
      }
    }

    const student = await prisma.student.create({
      data: {
        userId: studentData.userId,
        gradeLevelId: studentData.gradeLevelId,
        classId: studentData.classId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            role: true,
          },
        },
        gradeLevel: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        class: {
          select: {
            id: true,
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
            schedule: true,
            roomNumber: true,
          },
        },
      },
    });

    return student;
  }

  /**
   * Update student by ID
   */
  async updateStudent(id: string, updateData: UpdateStudentData): Promise<any> {
    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      throw new Error('Student not found');
    }

    // Check if grade level exists (if being updated)
    if (updateData.gradeLevelId) {
      const gradeLevel = await prisma.gradeLevel.findUnique({
        where: { id: updateData.gradeLevelId },
      });

      if (!gradeLevel) {
        throw new Error('Grade level not found');
      }
    }

    // Check if class exists (if being updated)
    if (updateData.classId) {
      const classExists = await prisma.class.findUnique({
        where: { id: updateData.classId },
      });

      if (!classExists) {
        throw new Error('Class not found');
      }
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            role: true,
          },
        },
        gradeLevel: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        class: {
          select: {
            id: true,
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
            schedule: true,
            roomNumber: true,
          },
        },
      },
    });

    return updatedStudent;
  }

  /**
   * Delete student by ID
   */
  async deleteStudent(id: string): Promise<void> {
    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      throw new Error('Student not found');
    }

    // Delete student (cascade will handle related records)
    await prisma.student.delete({
      where: { id },
    });
  }

  /**
   * Get students by grade level
   */
  async getStudentsByGradeLevel(gradeLevelId: string, options: PaginationOptions = {}): Promise<PaginatedResponse<any>> {
    return this.getAllStudents({ ...options, gradeLevelId });
  }

  /**
   * Get students by class
   */
  async getStudentsByClass(classId: string, options: PaginationOptions = {}): Promise<PaginatedResponse<any>> {
    return this.getAllStudents({ ...options, classId });
  }

  /**
   * Search students
   */
  async searchStudents(searchTerm: string, options: PaginationOptions = {}): Promise<PaginatedResponse<any>> {
    return this.getAllStudents({ ...options, search: searchTerm });
  }

  /**
   * Get student statistics
   */
  async getStudentStatistics(): Promise<any> {
    const [totalStudents, gradeLevelStats, classStats] = await Promise.all([
      prisma.student.count(),
      prisma.student.groupBy({
        by: ['gradeLevelId'],
        _count: {
          gradeLevelId: true,
        },
        include: {
          gradeLevel: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.student.groupBy({
        by: ['classId'],
        _count: {
          classId: true,
        },
        where: {
          classId: {
            not: null,
          },
        },
      }),
    ]);

    const gradeLevelCounts = gradeLevelStats.reduce((acc, stat) => {
      acc[stat.gradeLevel.name] = stat._count.gradeLevelId;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalStudents,
      gradeLevelCounts,
      studentsWithClass: classStats.length,
      studentsWithoutClass: totalStudents - classStats.length,
    };
  }
}

export default new StudentService(); 