const { User, Student, GradeLevel, Class, Parent, ParentStudent } = require('../../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

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
      
      const includeClause = [
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
          as: 'Classes', // Note: Alias should match the association in the model
          through: { attributes: [] } // Don't include enrollment details in the list view
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
      ];

      // If filtering by classId, add it to the include clause for Class
      if (classId) {
        const classInclude = includeClause.find(i => i.model === Class);
        classInclude.where = { id: classId };
        classInclude.required = true; // Makes it an INNER JOIN
      }

      // Get students with pagination and includes
      const { count, rows: students } = await Student.findAndCountAll({
        where: whereClause,
        include: includeClause,
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
            as: 'Classes', // Alias should match the association
            through: { attributes: ['academicYear', 'finalGrade'] } // Include enrollment details
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
      const { firstName, lastName, email, password, phoneNumber, gradeLevelId, parentIds } = req.body;

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
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long',
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

      // Hash password
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
            as: 'Classes',
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
   * Public student signup, only available in August.
   * POST /students/signup
   */
  async publicSignup(req, res) {
    try {
      const { firstName, lastName, email, password, gradeLevelId } = req.body;

      // --- Validation ---
      const errors = [];
      if (!firstName) errors.push({ field: 'firstName', message: 'First name is required' });
      if (!lastName) errors.push({ field: 'lastName', message: 'Last name is required' });
      if (!email) errors.push({ field: 'email', message: 'Email is required' });
      if (!password) errors.push({ field: 'password', message: 'Password is required' });
      if (!gradeLevelId) errors.push({ field: 'gradeLevelId', message: 'Grade level is required' });

      if (errors.length > 0) {
        return res.status(400).json({ success: false, message: 'Required fields missing', errors });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      // Validate grade level exists
      const gradeLevel = await GradeLevel.findByPk(gradeLevelId);
      if (!gradeLevel) {
        return res.status(400).json({ success: false, message: 'Grade level not found' });
      }
      // --- End Validation ---

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'STUDENT',
      });

      const student = await Student.create({
        userId: user.id,
        gradeLevelId,
      });

      res.status(201).json({
        success: true,
        message: 'Student signed up successfully. Please await admin approval.',
        data: {
          studentId: student.id,
          userId: user.id,
          email: user.email,
        }
      });

    } catch (error) {
      console.error('Public signup error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * Update student
   * PUT /students/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, phoneNumber, gradeLevelId, parentIds } = req.body;

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
            as: 'Classes',
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

  /**
   * Promote a list of students to the next grade level
   * POST /students/promote
   */
  async promote(req, res) {
    const { studentIds, nextGradeLevelId } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'studentIds (non-empty array) is required.' });
    }
    if (!nextGradeLevelId || typeof nextGradeLevelId !== 'number') {
      return res.status(400).json({ error: 'nextGradeLevelId (number) is required.' });
    }

    try {
      // Verify the target grade level exists
      const gradeLevel = await GradeLevel.findByPk(nextGradeLevelId);
      if (!gradeLevel) {
        return res.status(404).json({ error: 'Target grade level not found.' });
      }

      // Bulk update students' grade level
      const [updatedCount] = await Student.update(
        { gradeLevelId: nextGradeLevelId },
        { where: { id: studentIds } }
      );

      if (updatedCount === 0) {
        return res.status(404).json({ message: 'No students found or updated for the given IDs.' });
      }

      res.json({ message: `${updatedCount} student(s) promoted successfully to ${gradeLevel.name}.` });
    } catch (err) {
      res.status(500).json({ error: 'Failed to promote students.' });
    }
  }
}

module.exports = new StudentController();