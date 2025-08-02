const bcrypt = require('bcryptjs');
const { User, Student, Teacher, Parent, Staff } = require('../../models');
const { Op } = require('sequelize');

class UserController {
  /**
   * List all users with pagination and filtering
   * GET /users
   */
  async list(req, res) {
    try {
      const { page = 1, limit = 10, search, role, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
      
      const offset = (page - 1) * limit;
      
      // Build where clause
      const whereClause = {};
      
      if (search) {
        whereClause[Op.or] = [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }
      
      if (role) {
        whereClause.role = role;
      }

      // Get users with pagination
      const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password'] },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: totalPages
        }
      });

    } catch (error) {
      console.error('List users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get user by ID
   * GET /users/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Student,
            as: 'Student',
            attributes: ['id', 'gradeLevelId', 'classId']
          },
          {
            model: Teacher,
            as: 'Teacher',
            attributes: ['id']
          },
          {
            model: Parent,
            as: 'Parent',
            attributes: ['id']
          },
          {
            model: Staff,
            as: 'Staff',
            attributes: ['id']
          }
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user
      });

    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Create new user
   * POST /users
   */
  async create(req, res) {
    try {
      const { firstName, lastName, email, password, role, phoneNumber } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: 'All required fields must be provided',
          errors: [
            { field: 'firstName', message: 'First name is required' },
            { field: 'lastName', message: 'Last name is required' },
            { field: 'email', message: 'Email is required' },
            { field: 'password', message: 'Password is required' },
            { field: 'role', message: 'Role is required' }
          ]
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format',
          errors: [{ field: 'email', message: 'Please provide a valid email address' }]
        });
      }

      // Validate password strength
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long',
          errors: [{ field: 'password', message: 'Password must be at least 6 characters' }]
        });
      }

      // Validate role
      const validRoles = ['ADMIN', 'STAFF', 'TEACHER', 'STUDENT', 'PARENT'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role',
          errors: [{ field: 'role', message: 'Role must be one of: ADMIN, STAFF, TEACHER, STUDENT, PARENT' }]
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists',
          errors: [{ field: 'email', message: 'Email is already registered' }]
        });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        phoneNumber: phoneNumber || null
      });

      // Remove password from response
      const userResponse = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: userResponse
      });

    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update user
   * PUT /users/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, password, role, phoneNumber } = req.body;

      // Find user
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
      }

      // Validate email format if provided
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid email format',
            errors: [{ field: 'email', message: 'Please provide a valid email address' }]
          });
        }

        // Check if email is already taken by another user
        const existingUser = await User.findOne({ 
          where: { 
            email,
            id: { [Op.ne]: id } // Exclude current user
          }
        });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email is already taken by another user',
            errors: [{ field: 'email', message: 'Email is already registered' }]
          });
        }
      }

      // Validate password strength if provided
      if (password && password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long',
          errors: [{ field: 'password', message: 'Password must be at least 6 characters' }]
        });
      }

      // Validate role if provided
      if (role) {
        const validRoles = ['ADMIN', 'STAFF', 'TEACHER', 'STUDENT', 'PARENT'];
        if (!validRoles.includes(role)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid role',
            errors: [{ field: 'role', message: 'Role must be one of: ADMIN, STAFF, TEACHER, STUDENT, PARENT' }]
          });
        }
      }

      // Prepare update data
      const updateData = {};
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

      // Hash password if provided
      if (password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(password, saltRounds);
      }

      // Update user
      await user.update(updateData);

      // Remove password from response
      const userResponse = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: userResponse
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Delete user
   * DELETE /users/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Find user
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
      }

      // Check if user has associated records
      const hasStudent = await Student.findOne({ where: { userId: id } });
      const hasTeacher = await Teacher.findOne({ where: { userId: id } });
      const hasParent = await Parent.findOne({ where: { userId: id } });
      const hasStaff = await Staff.findOne({ where: { userId: id } });

      if (hasStudent || hasTeacher || hasParent || hasStaff) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete user with associated records. Please delete associated records first.',
          timestamp: new Date().toISOString()
        });
      }

      // Delete user
      await user.destroy();

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get current user profile
   * GET /users/me
   */
  async getCurrentUser(req, res) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
          timestamp: new Date().toISOString()
        });
      }

      // Get full user data from database
      const userData = await User.findByPk(user.id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Student,
            as: 'Student',
            attributes: ['id', 'gradeLevelId', 'classId']
          },
          {
            model: Teacher,
            as: 'Teacher',
            attributes: ['id']
          },
          {
            model: Parent,
            as: 'Parent',
            attributes: ['id']
          },
          {
            model: Staff,
            as: 'Staff',
            attributes: ['id']
          }
        ]
      });

      if (!userData) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json({
        success: true,
        message: 'Current user profile retrieved successfully',
        data: userData
      });

    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new UserController(); 