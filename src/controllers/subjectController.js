const { Subject, Teacher, Class, User } = require('../../models');
const { Op } = require('sequelize');

const subjectController = {
  // Create a new subject
  async create(req, res) {
    try {
      const { name, description, credits, department } = req.body;

      // Validation
      if (!name || !description) {
        return res.status(400).json({
          success: false,
          message: 'Name and description are required',
          timestamp: new Date().toISOString()
        });
      }

      // Check if subject already exists
      const existingSubject = await Subject.findOne({ where: { name } });
      if (existingSubject) {
        return res.status(400).json({
          success: false,
          message: 'Subject with this name already exists',
          timestamp: new Date().toISOString()
        });
      }

      const subject = await Subject.create({
        name,
        description,
        credits: credits || 3,
        department: department || 'General'
      });

      res.status(201).json({
        success: true,
        message: 'Subject created successfully',
        data: subject,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating subject:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  },

  // Get all subjects with filtering and pagination
  async list(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        department,
        credits,
        sortBy = 'name',
        sortOrder = 'ASC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const whereClause = {};

      // Apply filters
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      if (department) {
        whereClause.department = department;
      }

      if (credits) {
        whereClause.credits = parseInt(credits);
      }

      const { count, rows: subjects } = await Subject.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset,
        order: [[sortBy, sortOrder.toUpperCase()]],
        include: [
          {
            model: Teacher,
            as: 'Teachers',
            through: { attributes: [] },
            include: [
              {
                model: User,
                attributes: ['firstName', 'lastName', 'email']
              }
            ]
          }
        ]
      });

      res.json({
        success: true,
        message: 'Subjects retrieved successfully',
        data: {
          subjects,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / parseInt(limit)),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching subjects:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  },

  // Get subject by ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const subject = await Subject.findByPk(id, {
        include: [
          {
            model: Teacher,
            as: 'Teachers',
            through: { attributes: [] },
            include: [
              {
                model: User,
                attributes: ['firstName', 'lastName', 'email']
              }
            ]
          },
          {
            model: Class,
            as: 'Classes',
            attributes: ['id', 'schedule', 'roomNumber', 'capacity']
          }
        ]
      });

      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found',
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        message: 'Subject retrieved successfully',
        data: subject,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching subject:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  },

  // Update subject
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, credits, department } = req.body;

      const subject = await Subject.findByPk(id);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found',
          timestamp: new Date().toISOString()
        });
      }

      // Check if name is being changed and if it conflicts
      if (name && name !== subject.name) {
        const existingSubject = await Subject.findOne({ 
          where: { 
            name,
            id: { [Op.ne]: id }
          }
        });
        if (existingSubject) {
          return res.status(400).json({
            success: false,
            message: 'Subject with this name already exists',
            timestamp: new Date().toISOString()
          });
        }
      }

      await subject.update({
        name: name || subject.name,
        description: description || subject.description,
        credits: credits !== undefined ? credits : subject.credits,
        department: department || subject.department
      });

      res.json({
        success: true,
        message: 'Subject updated successfully',
        data: subject,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating subject:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  },

  // Delete subject
  async delete(req, res) {
    try {
      const { id } = req.params;

      const subject = await Subject.findByPk(id);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found',
          timestamp: new Date().toISOString()
        });
      }

      // Check if subject has associated classes or grades
      const classCount = await Class.count({ where: { subjectId: id } });
      if (classCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete subject with associated classes',
          timestamp: new Date().toISOString()
        });
      }

      await subject.destroy();

      res.json({
        success: true,
        message: 'Subject deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error deleting subject:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  },

  // Assign teacher to subject
  async assignTeacher(req, res) {
    try {
      const { id } = req.params;
      const { teacherId } = req.body;

      if (!teacherId) {
        return res.status(400).json({
          success: false,
          message: 'Teacher ID is required',
          timestamp: new Date().toISOString()
        });
      }

      const subject = await Subject.findByPk(id);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found',
          timestamp: new Date().toISOString()
        });
      }

      const teacher = await Teacher.findByPk(teacherId);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found',
          timestamp: new Date().toISOString()
        });
      }

      // Check if teacher is already assigned to this subject
      const existingAssignment = await subject.hasTeacher(teacher);
      if (existingAssignment) {
        return res.status(400).json({
          success: false,
          message: 'Teacher is already assigned to this subject',
          timestamp: new Date().toISOString()
        });
      }

      await subject.addTeacher(teacher);

      res.json({
        success: true,
        message: 'Teacher assigned to subject successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error assigning teacher to subject:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  },

  // Remove teacher from subject
  async removeTeacher(req, res) {
    try {
      const { id, teacherId } = req.params;

      const subject = await Subject.findByPk(id);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found',
          timestamp: new Date().toISOString()
        });
      }

      const teacher = await Teacher.findByPk(teacherId);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher not found',
          timestamp: new Date().toISOString()
        });
      }

      // Check if teacher is assigned to this subject
      const existingAssignment = await subject.hasTeacher(teacher);
      if (!existingAssignment) {
        return res.status(400).json({
          success: false,
          message: 'Teacher is not assigned to this subject',
          timestamp: new Date().toISOString()
        });
      }

      await subject.removeTeacher(teacher);

      res.json({
        success: true,
        message: 'Teacher removed from subject successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error removing teacher from subject:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }
};

module.exports = subjectController;
