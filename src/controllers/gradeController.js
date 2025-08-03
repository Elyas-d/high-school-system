const { Grade, Student, Subject, Class, User } = require('../../models');
const { Op } = require('sequelize');

class GradeController {
  /**
   * Assign grade to student
   * POST /grades
   */
  async assignGrade(req, res) {
    try {
      const { studentId, subjectId, classId, gradeValue, gradeType, maxPoints, description } = req.body;

      // Validate required fields
      if (!studentId || !subjectId || gradeValue === undefined || gradeValue === null) {
        return res.status(400).json({
          success: false,
          message: 'Required fields missing',
          errors: [
            { field: 'studentId', message: 'Student ID is required' },
            { field: 'subjectId', message: 'Subject ID is required' },
            { field: 'gradeValue', message: 'Grade value is required' }
          ]
        });
      }

      // Validate grade value range
      if (gradeValue < 0 || gradeValue > (maxPoints || 100)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid grade value',
          errors: [{ field: 'gradeValue', message: `Grade value must be between 0 and ${maxPoints || 100}` }]
        });
      }

      // Verify student exists
      const student = await Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found',
          timestamp: new Date().toISOString()
        });
      }

      // Verify subject exists
      const subject = await Subject.findByPk(subjectId);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found',
          timestamp: new Date().toISOString()
        });
      }

      // Verify class exists if provided
      if (classId) {
        const classObj = await Class.findByPk(classId);
        if (!classObj) {
          return res.status(404).json({
            success: false,
            message: 'Class not found',
            timestamp: new Date().toISOString()
          });
        }
      }

      // Create grade
      const grade = await Grade.create({
        studentId,
        subjectId,
        classId: classId || null,
        gradeValue,
        gradeType: gradeType || 'ASSIGNMENT',
        maxPoints: maxPoints || 100,
        description: description || null,
        gradedAt: new Date()
      });

      // Get complete grade data with relationships
      const completeGrade = await Grade.findByPk(grade.id, {
        include: [
          {
            model: Student,
            as: 'Student',
            include: [
              {
                model: User,
                as: 'User',
                attributes: ['id', 'firstName', 'lastName', 'email']
              }
            ]
          },
          {
            model: Subject,
            as: 'Subject',
            attributes: ['id', 'name', 'description']
          },
          {
            model: Class,
            as: 'Class',
            attributes: ['id', 'schedule', 'roomNumber']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Grade assigned successfully',
        data: completeGrade
      });

    } catch (error) {
      console.error('Assign grade error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Fetch grades by class
   * GET /grades/class/:classId
   */
  async fetchByClass(req, res) {
    try {
      const { classId } = req.params;
      const { gradeType, startDate, endDate } = req.query;

      // Verify class exists
      const classObj = await Class.findByPk(classId);
      if (!classObj) {
        return res.status(404).json({
          success: false,
          message: 'Class not found',
          timestamp: new Date().toISOString()
        });
      }

      // Build where clause
      const whereClause = { classId };

      if (gradeType) {
        whereClause.gradeType = gradeType;
      }

      if (startDate && endDate) {
        whereClause.gradedAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      } else if (startDate) {
        whereClause.gradedAt = {
          [Op.gte]: new Date(startDate)
        };
      } else if (endDate) {
        whereClause.gradedAt = {
          [Op.lte]: new Date(endDate)
        };
      }

      // Get grades
      const grades = await Grade.findAll({
        where: whereClause,
        include: [
          {
            model: Student,
            as: 'Student',
            include: [
              {
                model: User,
                as: 'User',
                attributes: ['id', 'firstName', 'lastName']
              }
            ]
          },
          {
            model: Subject,
            as: 'Subject',
            attributes: ['id', 'name', 'description']
          }
        ],
        order: [['gradedAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        message: 'Grades retrieved successfully',
        data: grades
      });

    } catch (error) {
      console.error('Fetch grades by class error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Fetch grades by student
   * GET /grades/student/:studentId
   */
  async fetchByStudent(req, res) {
    try {
      const { studentId } = req.params;
      const { subjectId, gradeType, startDate, endDate } = req.query;

      // Verify student exists
      const student = await Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found',
          timestamp: new Date().toISOString()
        });
      }

      // Build where clause
      const whereClause = { studentId };

      if (subjectId) {
        whereClause.subjectId = subjectId;
      }

      if (gradeType) {
        whereClause.gradeType = gradeType;
      }

      if (startDate && endDate) {
        whereClause.gradedAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      } else if (startDate) {
        whereClause.gradedAt = {
          [Op.gte]: new Date(startDate)
        };
      } else if (endDate) {
        whereClause.gradedAt = {
          [Op.lte]: new Date(endDate)
        };
      }

      // Get grades
      const grades = await Grade.findAll({
        where: whereClause,
        include: [
          {
            model: Subject,
            as: 'Subject',
            attributes: ['id', 'name', 'description']
          },
          {
            model: Class,
            as: 'Class',
            attributes: ['id', 'schedule', 'roomNumber']
          }
        ],
        order: [['gradedAt', 'DESC']]
      });

      // Calculate grade statistics
      const stats = {
        totalGrades: grades.length,
        averageGrade: grades.length > 0 
          ? (grades.reduce((sum, grade) => sum + parseFloat(grade.gradeValue), 0) / grades.length).toFixed(2)
          : 0,
        highestGrade: grades.length > 0 
          ? Math.max(...grades.map(grade => parseFloat(grade.gradeValue)))
          : 0,
        lowestGrade: grades.length > 0 
          ? Math.min(...grades.map(grade => parseFloat(grade.gradeValue)))
          : 0
      };

      res.status(200).json({
        success: true,
        message: 'Student grades retrieved successfully',
        data: {
          grades,
          statistics: stats
        }
      });

    } catch (error) {
      console.error('Fetch grades by student error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Fetch grades by subject
   * GET /grades/subject/:subjectId
   */
  async fetchBySubject(req, res) {
    try {
      const { subjectId } = req.params;
      const { classId, gradeType, startDate, endDate } = req.query;

      // Verify subject exists
      const subject = await Subject.findByPk(subjectId);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found',
          timestamp: new Date().toISOString()
        });
      }

      // Build where clause
      const whereClause = { subjectId };

      if (classId) {
        whereClause.classId = classId;
      }

      if (gradeType) {
        whereClause.gradeType = gradeType;
      }

      if (startDate && endDate) {
        whereClause.gradedAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      } else if (startDate) {
        whereClause.gradedAt = {
          [Op.gte]: new Date(startDate)
        };
      } else if (endDate) {
        whereClause.gradedAt = {
          [Op.lte]: new Date(endDate)
        };
      }

      // Get grades
      const grades = await Grade.findAll({
        where: whereClause,
        include: [
          {
            model: Student,
            as: 'Student',
            include: [
              {
                model: User,
                as: 'User',
                attributes: ['id', 'firstName', 'lastName']
              }
            ]
          },
          {
            model: Class,
            as: 'Class',
            attributes: ['id', 'schedule', 'roomNumber']
          }
        ],
        order: [['gradedAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        message: 'Subject grades retrieved successfully',
        data: grades
      });

    } catch (error) {
      console.error('Fetch grades by subject error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update grade
   * PUT /grades/:id
   */
  async updateGrade(req, res) {
    try {
      const { id } = req.params;
      const { gradeValue, gradeType, maxPoints, description } = req.body;

      // Find grade
      const grade = await Grade.findByPk(id);
      if (!grade) {
        return res.status(404).json({
          success: false,
          message: 'Grade not found',
          timestamp: new Date().toISOString()
        });
      }

      // Validate grade value if provided
      if (gradeValue !== undefined && gradeValue !== null) {
        const maxPointsValue = maxPoints || grade.maxPoints;
        if (gradeValue < 0 || gradeValue > maxPointsValue) {
          return res.status(400).json({
            success: false,
            message: 'Invalid grade value',
            errors: [{ field: 'gradeValue', message: `Grade value must be between 0 and ${maxPointsValue}` }]
          });
        }
      }

      // Update grade
      const updateData = {};
      if (gradeValue !== undefined) updateData.gradeValue = gradeValue;
      if (gradeType) updateData.gradeType = gradeType;
      if (maxPoints !== undefined) updateData.maxPoints = maxPoints;
      if (description !== undefined) updateData.description = description;

      await grade.update(updateData);

      // Get updated grade with relationships
      const updatedGrade = await Grade.findByPk(id, {
        include: [
          {
            model: Student,
            as: 'Student',
            include: [
              {
                model: User,
                as: 'User',
                attributes: ['id', 'firstName', 'lastName', 'email']
              }
            ]
          },
          {
            model: Subject,
            as: 'Subject',
            attributes: ['id', 'name', 'description']
          },
          {
            model: Class,
            as: 'Class',
            attributes: ['id', 'schedule', 'roomNumber']
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Grade updated successfully',
        data: updatedGrade
      });

    } catch (error) {
      console.error('Update grade error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new GradeController();
