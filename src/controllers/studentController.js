const { User, Student, GradeLevel, Class, Parent, ParentStudent } = require('../../models');
const { Op } = require('sequelize');

class StudentController {
  /**
   * List all students with pagination and filtering
   * GET /students
   */
  async list(req, res) {
    try {
      const { page = 1, limit = 10, search, gradeLevel, classId, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
      
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
      
      if (gradeLevel) {
        whereClause.gradeLevelId = gradeLevel;
      }
      
      if (classId) {
        whereClause.classId = classId;
      }

      // Get students with pagination and includes
      const { count, rows: students } = await Student.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'phoneNumber']
          },
          {
            model: GradeLevel,
            as: 'GradeLevel',
            attributes: ['id', 'name', 'description']
          },
          {
            model: Class,
            as: 'Class',
            attributes: ['id', 'schedule', 'roomNumber'],
            include: [
              {
                model: require('../../models').Subject,
                as: 'Subject',
                attributes: ['id', 'name', 'description']
              }
            ]
          },
          {
            model: Parent,
            as: 'Parents',
            through: { attributes: [] },
            include: [
              {
                model: User,
                as: 'User',
                attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
              }
            ]
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        message: 'Students retrieved successfully',
        data: students,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: totalPages
        }
      });

    } catch (error) {
      console.error('List students error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get student by ID
   * GET /students/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      const student = await Student.findByPk(id, {
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'phoneNumber']
          },
          {
            model: GradeLevel,
            as: 'GradeLevel',
            attributes: ['id', 'name', 'description']
          },
          {
            model: Class,
            as: 'Class',
            attributes: ['id', 'schedule', 'roomNumber'],
            include: [
              {
                model: require('../../models').Subject,
                as: 'Subject',
                attributes: ['id', 'name', 'description']
              }
            ]
          },
          {
            model: Parent,
            as: 'Parents',
            through: { attributes: [] },
            include: [
              {
                model: User,
                as: 'User',
                attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
              }
            ]
          }
        ]
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found',
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json({
        success: true,
        message: 'Student retrieved successfully',
        data: student
      });

    } catch (error) {
      console.error('Get student by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Create new student
   * POST /students
   */
  async create(req, res) {
    try {
      const { firstName, lastName, email, password, phoneNumber, gradeLevelId, classId, parentIds } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !password || !gradeLevelId) {
        return res.status(400).json({
          success: false,
          message: 'Required fields missing',
          errors: [
            { field: 'firstName', message: 'First name is required' },
            { field: 'lastName', message: 'Last name is required' },
            { field: 'email', message: 'Email is required' },
            { field: 'password', message: 'Password is required' },
            { field: 'gradeLevelId', message: 'Grade level is required' }
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

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists',
          errors: [{ field: 'email', message: 'Email is already registered' }]
        });
      }

      // Validate grade level exists
      const gradeLevel = await GradeLevel.findByPk(gradeLevelId);
      if (!gradeLevel) {
        return res.status(400).json({
          success: false,
          message: 'Grade level not found',
          errors: [{ field: 'gradeLevelId', message: 'Invalid grade level' }]
        });
      }

      // Validate class exists if provided
      if (classId) {
        const classRecord = await Class.findByPk(classId);
        if (!classRecord) {
          return res.status(400).json({
            success: false,
            message: 'Class not found',
            errors: [{ field: 'classId', message: 'Invalid class' }]
          });
        }
      }

      // Validate parents exist if provided
      if (parentIds && parentIds.length > 0) {
        const parents = await Parent.findAll({ where: { id: parentIds } });
        if (parents.length !== parentIds.length) {
          return res.status(400).json({
            success: false,
            message: 'One or more parents not found',
            errors: [{ field: 'parentIds', message: 'Invalid parent IDs' }]
          });
        }
      }

      // Hash password
      const bcrypt = require('bcryptjs');
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user first
      const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'STUDENT',
        phoneNumber: phoneNumber || null
      });

      // Create student record
      const student = await Student.create({
        userId: user.id,
        gradeLevelId,
        classId: classId || null
      });

      // Associate with parents if provided
      if (parentIds && parentIds.length > 0) {
        await student.setParents(parentIds);
      }

      // Get the complete student data with includes
      const completeStudent = await Student.findByPk(student.id, {
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'phoneNumber']
          },
          {
            model: GradeLevel,
            as: 'GradeLevel',
            attributes: ['id', 'name', 'description']
          },
          {
            model: Class,
            as: 'Class',
            attributes: ['id', 'schedule', 'roomNumber']
          },
          {
            model: Parent,
            as: 'Parents',
            through: { attributes: [] },
            include: [
              {
                model: User,
                as: 'User',
                attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
              }
            ]
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Student created successfully',
        data: completeStudent
      });

    } catch (error) {
      console.error('Create student error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update student
   * PUT /students/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, phoneNumber, gradeLevelId, classId, parentIds } = req.body;

      // Find student
      const student = await Student.findByPk(id, {
        include: [
          {
            model: User,
            as: 'User'
          }
        ]
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found',
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
              id: { [Op.ne]: student.User.id }
            }
          });
          if (existingUser) {
            return res.status(400).json({
              success: false,
              message: 'Email is already taken by another user',
              errors: [{ field: 'email', message: 'Email is already registered' }]
            });
          }

          userUpdateData.email = email;
        }

        await student.User.update(userUpdateData);
      }

      // Update student data if provided
      const studentUpdateData = {};
      if (gradeLevelId) {
        // Validate grade level exists
        const gradeLevel = await GradeLevel.findByPk(gradeLevelId);
        if (!gradeLevel) {
          return res.status(400).json({
            success: false,
            message: 'Grade level not found',
            errors: [{ field: 'gradeLevelId', message: 'Invalid grade level' }]
          });
        }
        studentUpdateData.gradeLevelId = gradeLevelId;
      }

      if (classId !== undefined) {
        if (classId) {
          // Validate class exists
          const classRecord = await Class.findByPk(classId);
          if (!classRecord) {
            return res.status(400).json({
              success: false,
              message: 'Class not found',
              errors: [{ field: 'classId', message: 'Invalid class' }]
            });
          }
        }
        studentUpdateData.classId = classId;
      }

      if (Object.keys(studentUpdateData).length > 0) {
        await student.update(studentUpdateData);
      }

      // Update parent associations if provided
      if (parentIds !== undefined) {
        if (parentIds && parentIds.length > 0) {
          // Validate parents exist
          const parents = await Parent.findAll({ where: { id: parentIds } });
          if (parents.length !== parentIds.length) {
            return res.status(400).json({
              success: false,
              message: 'One or more parents not found',
              errors: [{ field: 'parentIds', message: 'Invalid parent IDs' }]
            });
          }
          await student.setParents(parentIds);
        } else {
          // Remove all parent associations
          await student.setParents([]);
        }
      }

      // Get updated student data
      const updatedStudent = await Student.findByPk(id, {
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'phoneNumber']
          },
          {
            model: GradeLevel,
            as: 'GradeLevel',
            attributes: ['id', 'name', 'description']
          },
          {
            model: Class,
            as: 'Class',
            attributes: ['id', 'schedule', 'roomNumber']
          },
          {
            model: Parent,
            as: 'Parents',
            through: { attributes: [] },
            include: [
              {
                model: User,
                as: 'User',
                attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber']
              }
            ]
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Student updated successfully',
        data: updatedStudent
      });

    } catch (error) {
      console.error('Update student error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Delete student
   * DELETE /students/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Find student
      const student = await Student.findByPk(id, {
        include: [
          {
            model: User,
            as: 'User'
          }
        ]
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found',
          timestamp: new Date().toISOString()
        });
      }

      // Delete student record first
      await student.destroy();

      // Delete associated user
      await student.User.destroy();

      res.status(200).json({
        success: true,
        message: 'Student deleted successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Delete student error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new StudentController(); 