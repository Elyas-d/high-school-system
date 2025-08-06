const { User, Parent, Student, Grade, Attendance, Subject, Class, sequelize } = require('../../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const createError = require('http-errors');

class ParentController {
  /**
   * Register a new parent
   * POST /parents/signup
   */
  async signUp(req, res, next) {
    const { firstName, lastName, email, password, phoneNumber, studentId } = req.body;

    // --- Direct Validation ---
    // 1. Check for missing fields and return a 400 error immediately.
    if (!firstName || !lastName || !email || !password || !studentId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Missing required fields: firstName, lastName, email, password, studentId.' }
      });
    }

    try {
      // 2. Check if student exists.
      const student = await Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({ success: false, error: { message: 'Student not found.' } });
      }

      // 3. Check if user already exists.
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ success: false, error: { message: 'A user with this email already exists.' } });
      }

      // --- Database Transaction ---
      // This part will only run if all validations above pass.
      const t = await sequelize.transaction();
      try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
          firstName, lastName, email, password: hashedPassword, role: 'PARENT'
        }, { transaction: t });

        const newParent = await Parent.create({
          userId: newUser.id, phoneNumber
        }, { transaction: t });

        await newParent.addStudent(student, { transaction: t });

        await t.commit();

        const userJson = newUser.toJSON();
        delete userJson.password;

        return res.status(201).json({
          success: true,
          message: 'Parent registered and linked to student successfully.',
          data: { user: userJson, parent: newParent }
        });

      } catch (transactionError) {
        // If an error occurs during the transaction, roll it back.
        await t.rollback();
        // Pass this unexpected error to the global error handler.
        return next(transactionError);
      }
    } catch (error) {
      // This will catch any other unexpected errors (e.g., database connection issue).
      return next(error);
    }
  }

  /**
   * Link parent to student
   * POST /parents/link
   */
  async linkToStudent(req, res, next) {
    try {
      const { parentId, studentId } = req.body;

      if (!parentId || !studentId) {
        return res.status(400).json({
          success: false,
          message: 'Required fields missing',
          errors: [
            !parentId && { field: 'parentId', message: 'Parent ID is required' },
            !studentId && { field: 'studentId', message: 'Student ID is required' }
          ].filter(Boolean)
        });
      }

      const parent = await Parent.findByPk(parentId, {
        include: [{ model: User, as: 'User', attributes: ['id', 'firstName', 'lastName', 'email'] }]
      });
      if (!parent) throw createError(404, 'Parent not found');

      const student = await Student.findByPk(studentId, {
        include: [{ model: User, as: 'User', attributes: ['id', 'firstName', 'lastName', 'email'] }]
      });
      if (!student) throw createError(404, 'Student not found');

      const existingRelation = await parent.hasStudent(student);
      if (existingRelation) throw createError(409, 'Parent is already linked to this student');

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
      next(error);
    }
  }

  /**
   * View child grades
   * GET /parents/:id/grades
   */
  async getChildGrades(req, res, next) {
    try {
      const { id } = req.params;
      const { studentId, subjectId, gradeType, startDate, endDate } = req.query;

      const parent = await Parent.findByPk(id);
      if (!parent) throw createError(404, 'Parent not found');

      const children = await parent.getStudents();
      const studentIds = children.map(student => student.id);

      if (studentIds.length === 0) {
        return res.status(200).json({ success: true, message: 'No students found for this parent', data: [] });
      }

      const whereClause = { studentId: { [Op.in]: studentIds } };

      if (studentId) {
        if (!studentIds.includes(parseInt(studentId))) {
          throw createError(403, 'Access denied: Student does not belong to this parent');
        }
        whereClause.studentId = studentId;
      }
      if (subjectId) whereClause.subjectId = subjectId;
      if (gradeType) whereClause.gradeType = gradeType;
      if (startDate && endDate) whereClause.gradedAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
      else if (startDate) whereClause.gradedAt = { [Op.gte]: new Date(startDate) };
      else if (endDate) whereClause.gradedAt = { [Op.lte]: new Date(endDate) };

      const grades = await Grade.findAll({
        where: whereClause,
        include: [
          { model: Student, as: 'Student', include: [{ model: User, as: 'User', attributes: ['id', 'firstName', 'lastName'] }] },
          { model: Subject, as: 'Subject', attributes: ['id', 'name', 'description'] },
          { model: Class, as: 'Class', attributes: ['id', 'schedule', 'roomNumber'] }
        ],
        order: [['gradedAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        message: 'Child grades retrieved successfully',
        data: grades
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * View child attendance
   * GET /parents/:id/attendance
   */
  async getChildAttendance(req, res, next) {
    try {
      const { id } = req.params;
      const { studentId, classId, status, startDate, endDate } = req.query;

      const parent = await Parent.findByPk(id);
      if (!parent) throw createError(404, 'Parent not found');

      const children = await parent.getStudents();
      const studentIds = children.map(student => student.id);

      if (studentIds.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No students found for this parent',
          data: { attendance: [], statistics: { totalRecords: 0, present: 0, absent: 0, late: 0, excused: 0, attendanceRate: '0.00' } }
        });
      }

      const whereClause = { studentId: { [Op.in]: studentIds } };

      if (studentId) {
        if (!studentIds.includes(parseInt(studentId))) {
          throw createError(403, 'Access denied: Student does not belong to this parent');
        }
        whereClause.studentId = studentId;
      }
      if (classId) whereClause.classId = classId;
      if (status) whereClause.status = status;
      if (startDate && endDate) whereClause.date = { [Op.between]: [startDate, endDate] };
      else if (startDate) whereClause.date = { [Op.gte]: startDate };
      else if (endDate) whereClause.date = { [Op.lte]: endDate };

      const attendance = await Attendance.findAll({
        where: whereClause,
        include: [
          { model: Student, as: 'Student', include: [{ model: User, as: 'User', attributes: ['id', 'firstName', 'lastName'] }] },
          { model: Class, as: 'Class', attributes: ['id', 'schedule', 'roomNumber'], include: [{ model: Subject, as: 'Subject', attributes: ['id', 'name', 'description'] }] }
        ],
        order: [['date', 'DESC']]
      });

      const stats = {
        totalRecords: attendance.length,
        present: attendance.filter(r => r.status === 'PRESENT').length,
        absent: attendance.filter(r => r.status === 'ABSENT').length,
        late: attendance.filter(r => r.status === 'LATE').length,
        excused: attendance.filter(r => r.status === 'EXCUSED').length,
        attendanceRate: '0.00'
      };

      if (stats.totalRecords > 0) {
        stats.attendanceRate = ((stats.present + stats.excused) / stats.totalRecords * 100).toFixed(2);
      }

      res.status(200).json({
        success: true,
        message: 'Child attendance retrieved successfully',
        data: { attendance, statistics: stats }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current parent's children
   * GET /parents/me/children
   */
  async getMyChildren(req, res, next) {
    try {
      const parent = await Parent.findOne({ where: { userId: req.user.id }, include: [{ model: Student, as: 'Students', include: [{ model: User, as: 'User' }] }] });
      if (!parent) throw createError(404, 'Parent profile not found for the current user.');

      res.status(200).json({
        success: true,
        message: "Children retrieved successfully.",
        data: parent.Students
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a parent
   * DELETE /parents/:id
   */
  async deleteParent(req, res, next) {
    const { id } = req.params;
    const t = await sequelize.transaction();

    try {
      const parent = await Parent.findByPk(id);
      if (!parent) {
        throw createError(404, 'Parent not found.');
      }

      const userId = parent.userId;
      await parent.destroy({ transaction: t });
      await User.destroy({ where: { id: userId }, transaction: t });

      await t.commit();

      res.status(200).json({
        success: true,
        message: 'Parent deleted successfully.'
      });
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }
}

module.exports = new ParentController();
