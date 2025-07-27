import { Request, Response } from 'express';
import prisma from '../../config/database';
import studentService, { CreateStudentData, UpdateStudentData, PaginationOptions } from './student.service';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware';

export class StudentController {
  /**
   * Get all students
   * GET /students
   */
  async getAllStudents(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, search, gradeLevelId, classId } = req.query;
      
      const options: PaginationOptions = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        search: (search as string) || '',
        gradeLevelId: gradeLevelId as string,
        classId: classId as string,
      };

      const result = await studentService.getAllStudents(options);

      res.status(200).json({
        success: true,
        message: 'Students retrieved successfully',
        data: result,
      });
    } catch (error) {
      console.error('Get all students error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve students',
      });
    }
  }

  /**
   * Get student by ID
   * GET /students/:id
   */
  async getStudentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const student = await studentService.getStudentById(id);

      res.status(200).json({
        success: true,
        message: 'Student retrieved successfully',
        data: student,
      });
    } catch (error) {
      console.error('Get student by ID error:', error);
      if (error instanceof Error && error.message === 'Student not found') {
        res.status(404).json({
          success: false,
          message: 'Student not found',
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to retrieve student',
        });
      }
    }
  }

  /**
   * Create new student
   * POST /students
   */
  async createStudent(req: Request, res: Response): Promise<void> {
    try {
      const studentData: CreateStudentData = req.body;

      // Validate required fields
      if (!studentData.userId || !studentData.gradeLevelId) {
        res.status(400).json({
          success: false,
          message: 'User ID and Grade Level ID are required',
        });
        return;
      }

      const student = await studentService.createStudent(studentData);

      res.status(201).json({
        success: true,
        message: 'Student created successfully',
        data: student,
      });
    } catch (error) {
      console.error('Create student error:', error);
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({
            success: false,
            message: error.message,
          });
        } else if (error.message.includes('already exists')) {
          res.status(409).json({
            success: false,
            message: error.message,
          });
        } else {
          res.status(400).json({
            success: false,
            message: error.message,
          });
        }
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to create student',
        });
      }
    }
  }

  /**
   * Update student by ID
   * PUT /students/:id
   */
  async updateStudent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateStudentData = req.body;

      const student = await studentService.updateStudent(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Student updated successfully',
        data: student,
      });
    } catch (error) {
      console.error('Update student error:', error);
      if (error instanceof Error && error.message === 'Student not found') {
        res.status(404).json({
          success: false,
          message: 'Student not found',
        });
      } else if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to update student',
        });
      }
    }
  }

  /**
   * Delete student by ID
   * DELETE /students/:id
   */
  async deleteStudent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await studentService.deleteStudent(id);

      res.status(200).json({
        success: true,
        message: 'Student deleted successfully',
      });
    } catch (error) {
      console.error('Delete student error:', error);
      if (error instanceof Error && error.message === 'Student not found') {
        res.status(404).json({
          success: false,
          message: 'Student not found',
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to delete student',
        });
      }
    }
  }

  /**
   * Get students by grade level
   * GET /students/grade-level/:gradeLevelId
   */
  async getStudentsByGradeLevel(req: Request, res: Response): Promise<void> {
    try {
      const { gradeLevelId } = req.params;
      const { page, limit, search } = req.query;

      const options: PaginationOptions = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        search: (search as string) || '',
        gradeLevelId,
      };

      const result = await studentService.getStudentsByGradeLevel(gradeLevelId, options);

      res.status(200).json({
        success: true,
        message: `Students in grade level ${gradeLevelId} retrieved successfully`,
        data: result,
      });
    } catch (error) {
      console.error('Get students by grade level error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve students by grade level',
      });
    }
  }

  /**
   * Get students by class
   * GET /students/class/:classId
   */
  async getStudentsByClass(req: Request, res: Response): Promise<void> {
    try {
      const { classId } = req.params;
      const { page, limit, search } = req.query;

      const options: PaginationOptions = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        search: (search as string) || '',
        classId,
      };

      const result = await studentService.getStudentsByClass(classId, options);

      res.status(200).json({
        success: true,
        message: `Students in class ${classId} retrieved successfully`,
        data: result,
      });
    } catch (error) {
      console.error('Get students by class error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve students by class',
      });
    }
  }

  /**
   * Search students
   * GET /students/search
   */
  async searchStudents(req: Request, res: Response): Promise<void> {
    try {
      const { q, page, limit, gradeLevelId, classId } = req.query;

      if (!q) {
        res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
        return;
      }

      const options: PaginationOptions = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        search: q as string,
        gradeLevelId: gradeLevelId as string,
        classId: classId as string,
      };

      const result = await studentService.searchStudents(q as string, options);

      res.status(200).json({
        success: true,
        message: 'Students search completed successfully',
        data: result,
      });
    } catch (error) {
      console.error('Search students error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search students',
      });
    }
  }

  /**
   * Get student statistics
   * GET /students/stats
   */
  async getStudentStatistics(req: Request, res: Response): Promise<void> {
    try {
      const stats = await studentService.getStudentStatistics();

      res.status(200).json({
        success: true,
        message: 'Student statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      console.error('Get student statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve student statistics',
      });
    }
  }

  /**
   * Get current student profile
   * GET /students/profile
   */
  async getCurrentStudentProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Find student by user ID
      const student = await prisma.student.findUnique({
        where: { userId: req.user.userId },
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
            take: 10,
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
        },
      });

      if (!student) {
        res.status(404).json({
          success: false,
          message: 'Student profile not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Student profile retrieved successfully',
        data: student,
      });
    } catch (error) {
      console.error('Get current student profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve student profile',
      });
    }
  }
}

export default new StudentController(); 