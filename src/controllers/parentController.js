const { User, Parent, Student, Grade, Attendance, Subject, Class } = require('../../models');
const { Op } = require('sequelize');

class ParentController {
  /**
   * Link parent to student
   * POST /parents/link
   */
  async linkToStudent(req, res) {
    try {
      const { parentId, studentId } = req.body;

      // Validate required fields
      if (!parentId || !studentId) {
        return res.status(400).json({
          success: false,
          message: 'Required fields missing',
          errors: [
            { field: 'parentId', message: 'Parent ID is required' },
            { field: 'studentId', message: 'Student ID is required' }
          ]
        });
      }

      // Find parent and student
      const parent = await Parent.findByPk(parentId, {
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      const student = await Student.findByPk(studentId, {
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent not found',
          timestamp: new Date().toISOString()
        });
      }

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found',
          timestamp: new Date().toISOString()
        });
      }

      // Check if relationship already exists
      const existingRelation = await parent.hasStudent(student);
      if (existingRelation) {
        return res.status(409).json({
          success: false,
          message: 'Parent is already linked to this student',
          timestamp: new Date().toISOString()
        });
      }

      // Add association in join table
      await parent.addStudent(student);

      res.status(200).json({
        success: true,
        message: 'Parent linked to student successfully',
        data: {
          parent: {
            id: parent.id,
            name: `${parent.User.firstName} ${parent.User.lastName}`,
            email: parent.User.email
          },
          student: {
            id: student.id,
            name: `${student.User.firstName} ${student.User.lastName}`,
            email: student.User.email
          }
        }
      });

    } catch (error) {
      console.error('Link parent to student error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * View child grades
   * GET /parents/:id/grades
   */
  async getChildGrades(req, res) {
    try {
      const { id } = req.params;
      const { studentId, subjectId, gradeType, startDate, endDate } = req.query;

      // Find parent
      const parent = await Parent.findByPk(id, {
        include: [
          {
            model: Student,
            as: 'Students',
            include: [
              {
                model: User,
                as: 'User',
                attributes: ['id', 'firstName', 'lastName', 'email']
              }
            ]
          }
        ]
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent not found',
          timestamp: new Date().toISOString()
        });
      }

      // Get student IDs that belong to this parent
      const studentIds = parent.Students.map(student => student.id);

      if (studentIds.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No students found for this parent',
          data: []
        });
      }

      // Build where clause for grades
      const whereClause = {
        studentId: { [Op.in]: studentIds }
      };

      // Apply filters
      if (studentId) {
        // Verify the student belongs to this parent
        if (!studentIds.includes(parseInt(studentId))) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Student does not belong to this parent',
            timestamp: new Date().toISOString()
          });
        }
        whereClause.studentId = studentId;
      }

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
        message: 'Child grades retrieved successfully',
        data: grades
      });

    } catch (error) {
      console.error('Get child grades error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * View child attendance
   * GET /parents/:id/attendance
   */
  async getChildAttendance(req, res) {
    try {
      const { id } = req.params;
      const { studentId, classId, status, startDate, endDate } = req.query;

      // Find parent
      const parent = await Parent.findByPk(id, {
        include: [
          {
            model: Student,
            as: 'Students',
            include: [
              {
                model: User,
                as: 'User',
                attributes: ['id', 'firstName', 'lastName', 'email']
              }
            ]
          }
        ]
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent not found',
          timestamp: new Date().toISOString()
        });
      }

      // Get student IDs that belong to this parent
      const studentIds = parent.Students.map(student => student.id);

      if (studentIds.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No students found for this parent',
          data: []
        });
      }

      // Build where clause for attendance
      const whereClause = {
        studentId: { [Op.in]: studentIds }
      };

      // Apply filters
      if (studentId) {
        // Verify the student belongs to this parent
        if (!studentIds.includes(parseInt(studentId))) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Student does not belong to this parent',
            timestamp: new Date().toISOString()
          });
        }
        whereClause.studentId = studentId;
      }

      if (classId) {
        whereClause.classId = classId;
      }

      if (status) {
        whereClause.status = status;
      }

      if (startDate && endDate) {
        whereClause.date = {
          [Op.between]: [startDate, endDate]
        };
      } else if (startDate) {
        whereClause.date = {
          [Op.gte]: startDate
        };
      } else if (endDate) {
        whereClause.date = {
          [Op.lte]: endDate
        };
      }

      // Get attendance records
      const attendance = await Attendance.findAll({
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
            attributes: ['id', 'schedule', 'roomNumber'],
            include: [
              {
                model: Subject,
                as: 'Subject',
                attributes: ['id', 'name', 'description']
              }
            ]
          }
        ],
        order: [['date', 'DESC']]
      });

      // Calculate attendance statistics
      const stats = {
        totalRecords: attendance.length,
        present: attendance.filter(record => record.status === 'PRESENT').length,
        absent: attendance.filter(record => record.status === 'ABSENT').length,
        late: attendance.filter(record => record.status === 'LATE').length,
        excused: attendance.filter(record => record.status === 'EXCUSED').length
      };

      stats.attendanceRate = stats.totalRecords > 0 
        ? ((stats.present + stats.excused) / stats.totalRecords * 100).toFixed(2)
        : 0;

      res.status(200).json({
        success: true,
        message: 'Child attendance retrieved successfully',
        data: {
          attendance,
          statistics: stats
        }
      });

    } catch (error) {
      console.error('Get child attendance error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new ParentController();
