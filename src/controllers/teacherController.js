const { User, Teacher, Class, Subject } = require('../../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

class TeacherController {
  /**
   * List all teachers with pagination and filtering
   * GET /teachers
   */
  async list(req, res) {
    try {
      const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
      
      const offset = (page - 1) * limit;
      
      // Build where clause
      const whereClause = {};
      
      if (search) {
        whereClause[Op.or] = [
          { '$User.firstName$': { [Op.like]: `%${search}%` } },
          { '$User.lastName$': { [Op.like]: `%${search}%` } },
          { '$User.email$': { [Op.like]: `%${search}%` } }
        ];
      }

      // Get teachers with pagination and includes
      const { count, rows: teachers } = await Teacher.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'phoneNumber']
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        message: 'Teachers retrieved successfully',
        data: {
          teachers,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalCount: count,
            hasNext: parseInt(page) < totalPages,
            hasPrevious: parseInt(page) > 1
          }
        }
      });

    } catch (error) {
      console.error('List teachers error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get teacher by ID
   * GET /teachers/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      const teacher = await Teacher.findByPk(id, {
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'phoneNumber']
          },
          {
            model: Class,
            as: 'Classes',
            include: [
              {
                model: Subject,
                as: 'Subject',
                attributes: ['id', 'name', 'description']
              }
            ]
          }
        ]
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found',
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json({
        success: true,
        message: 'Teacher retrieved successfully',
        data: teacher
      });

    } catch (error) {
      console.error('Get teacher by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Create new teacher
   * POST /teachers
   */
  async create(req, res) {
    try {
      const { firstName, lastName, email, password, phoneNumber } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Required fields missing',
          errors: [
            { field: 'firstName', message: 'First name is required' },
            { field: 'lastName', message: 'Last name is required' },
            { field: 'email', message: 'Email is required' },
            { field: 'password', message: 'Password is required' }
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

      // Check if email already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists',
          errors: [{ field: 'email', message: 'Email is already registered' }]
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user with TEACHER role
      const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber,
        role: 'TEACHER'
      });

      // Create teacher profile
      const teacher = await Teacher.create({
        userId: user.id
      });

      // Get complete teacher data
      const completeTeacher = await Teacher.findByPk(teacher.id, {
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'phoneNumber']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Teacher created successfully',
        data: completeTeacher
      });

    } catch (error) {
      console.error('Create teacher error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update teacher
   * PUT /teachers/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, phoneNumber } = req.body;

      // Find teacher
      const teacher = await Teacher.findByPk(id, {
        include: [
          {
            model: User,
            as: 'User'
          }
        ]
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found',
          timestamp: new Date().toISOString()
        });
      }

      // Update user data if provided
      if (firstName || lastName || email || phoneNumber !== undefined) {
        const userUpdateData = {};
        if (firstName) userUpdateData.firstName = firstName;
        if (lastName) userUpdateData.lastName = lastName;
        if (phoneNumber !== undefined) userUpdateData.phoneNumber = phoneNumber;

        // Validate email if provided
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
              id: { [Op.ne]: teacher.User.id }
            }
          });
          if (existingUser) {
            return res.status(409).json({
              success: false,
              message: 'Email is already taken by another user',
              errors: [{ field: 'email', message: 'Email is already registered' }]
            });
          }

          userUpdateData.email = email;
        }

        await teacher.User.update(userUpdateData);
      }

      // Get updated teacher data
      const updatedTeacher = await Teacher.findByPk(id, {
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'phoneNumber']
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Teacher updated successfully',
        data: updatedTeacher
      });

    } catch (error) {
      console.error('Update teacher error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Delete teacher
   * DELETE /teachers/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Find teacher
      const teacher = await Teacher.findByPk(id, {
        include: [
          {
            model: User,
            as: 'User'
          }
        ]
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found',
          timestamp: new Date().toISOString()
        });
      }

      // Delete teacher record first
      await teacher.destroy();

      // Delete associated user
      await teacher.User.destroy();

      res.status(200).json({
        success: true,
        message: 'Teacher deleted successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Delete teacher error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Assign classes to teacher
   * POST /teachers/:id/assign
   */
  async assignClasses(req, res) {
    try {
      const { id } = req.params;
      const { classIds } = req.body;

      // Find teacher
      const teacher = await Teacher.findByPk(id);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found',
          timestamp: new Date().toISOString()
        });
      }

      // Validate classIds
      if (!Array.isArray(classIds)) {
        return res.status(400).json({
          success: false,
          message: 'classIds must be an array',
          errors: [{ field: 'classIds', message: 'Must be an array of class IDs' }]
        });
      }

      // Update classes to assign to this teacher
      await Class.update(
        { teacherId: teacher.id },
        { where: { id: classIds } }
      );

      res.status(200).json({
        success: true,
        message: 'Classes assigned to teacher successfully',
        data: { teacherId: teacher.id, classIds }
      });

    } catch (error) {
      console.error('Assign classes error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get teacher's assigned classes
   * GET /teachers/:id/classes
   */
  async getClasses(req, res) {
    try {
      const { id } = req.params;

      // Find teacher
      const teacher = await Teacher.findByPk(id);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found',
          timestamp: new Date().toISOString()
        });
      }

      // Get assigned classes
      const classes = await Class.findAll({
        where: { teacherId: teacher.id },
        include: [
          {
            model: Subject,
            as: 'Subject',
            attributes: ['id', 'name', 'description']
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Teacher classes retrieved successfully',
        data: classes
      });

    } catch (error) {
      console.error('Get teacher classes error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new TeacherController();
