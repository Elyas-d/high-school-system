const { Enrollment, Student, Class } = require('../../models');

module.exports = {
  // Enroll one or more students into a class for an academic year
  async create(req, res) {
    const { studentIds, classId, academicYear } = req.body;
    const errors = [];

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      errors.push('studentIds (non-empty array) is required');
    }
    if (!classId || typeof classId !== 'number') {
      errors.push('classId (number) is required');
    }
    if (!academicYear || typeof academicYear !== 'string' || !academicYear.trim()) {
      errors.push('academicYear (non-empty string) is required');
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    try {
      // Check if class exists
      const classExists = await Class.findByPk(classId);
      if (!classExists) {
        return res.status(404).json({ error: 'Class not found.' });
      }

      // Prepare enrollment records
      const enrollments = studentIds.map(studentId => ({
        studentId,
        classId,
        academicYear
      }));

      // Bulk create enrollments
      const newEnrollments = await Enrollment.bulkCreate(enrollments, { ignoreDuplicates: true });
      res.status(201).json({ message: 'Students enrolled successfully.', data: newEnrollments });
    } catch (err) {
      res.status(500).json({ error: 'Failed to enroll students.' });
    }
  },

  // List all enrollments
  async list(req, res) {
    try {
      const enrollments = await Enrollment.findAll({
        include: [Student, Class]
      });
      res.json(enrollments);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch enrollments.' });
    }
  }
};
