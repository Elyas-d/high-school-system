import { Request } from 'express';
import prisma from '../../config/database';
import { UserRole } from '@prisma/client';

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: UserRole;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  role?: UserRole;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
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

export class UserService {
  /**
   * Get all users with pagination and filtering
   */
  async getAllUsers(options: PaginationOptions = {}): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 10, search = '', role } = options;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          // Exclude password for security
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Include related data based on role
        student: {
          select: {
            id: true,
            gradeLevel: {
              select: {
                id: true,
                name: true,
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
              },
            },
          },
        },
        parent: {
          select: {
            id: true,
            students: {
              select: {
                student: {
                  select: {
                    id: true,
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
        },
        teacher: {
          select: {
            id: true,
            classes: {
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
        },
        staff: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserData): Promise<any> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = await prisma.user.create({
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password, // Should be hashed before calling this service
        phoneNumber: userData.phoneNumber || null,
        role: userData.role,
      },
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
    });

    return user;
  }

  /**
   * Update user by ID
   */
  async updateUser(id: string, updateData: UpdateUserData): Promise<any> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    // If email is being updated, check for duplicates
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
    });

    return updatedUser;
  }

  /**
   * Delete user by ID
   */
  async deleteUser(id: string): Promise<void> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole, options: PaginationOptions = {}): Promise<PaginatedResponse<any>> {
    return this.getAllUsers({ ...options, role });
  }

  /**
   * Search users
   */
  async searchUsers(searchTerm: string, options: PaginationOptions = {}): Promise<PaginatedResponse<any>> {
    return this.getAllUsers({ ...options, search: searchTerm });
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(): Promise<any> {
    const [totalUsers, roleStats] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: {
          role: true,
        },
      }),
    ]);

    const roleCounts = roleStats.reduce((acc, stat) => {
      acc[stat.role] = stat._count.role;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers,
      roleCounts,
    };
  }
}

export default new UserService(); 