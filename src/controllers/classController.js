const { Class, Teacher, Student, Subject } = require('../../models');

module.exports = {
  // List all classes
  async listAll(req, res) {
    try {
      const classes = await Class.findAll({
        include: [
          { model: Teacher, attributes: ['id', 'userId'] },
          { model: Subject, attributes: ['id', 'name'] }
        ]
      });
      res.json(classes);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch classes' });
    }
  },

  // Get class by ID
  async read(req, res) {
    try {
      const classObj = await Class.findByPk(req.params.id, {
        include: [
          { model: Teacher, attributes: ['id', 'userId'] },
          { model: Subject, attributes: ['id', 'name'] },
          { model: Student, attributes: ['id', 'userId'] }
        ]
      });
      if (!classObj) return res.status(404).json({ error: 'Class not found' });
      res.json(classObj);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch class' });
    }
  },

  // Create class
  async create(req, res) {
    const { subjectId, teacherId, schedule, roomNumber } = req.body;
    const errors = [];

    if (!subjectId || typeof subjectId !== 'number') {
      errors.push('subjectId (number) is required');
    }
    if (!teacherId || typeof teacherId !== 'number') {
      errors.push('teacherId (number) is required');
    }
    if (!schedule || typeof schedule !== 'string' || !schedule.trim()) {
      errors.push('schedule (non-empty string) is required');
    }
    if (!roomNumber || typeof roomNumber !== 'string' || !roomNumber.trim()) {
      errors.push('roomNumber (non-empty string) is required');
    }

    // If any validation errors, return all at once
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    // Check if subject exists
    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
      errors.push('Subject not found');
    }

    // Check if teacher exists
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      errors.push('Teacher not found');
    }

    if (errors.length > 0) {
      return res.status(404).json({ error: 'Validation failed', details: errors });
    }

    try {
      const newClass = await Class.create({ subjectId, teacherId, schedule, roomNumber });
      res.status(201).json(newClass);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create class. Please check your input and try again.' });
    }
  },

  // Update class
  async update(req, res) {
    try {
      const { subjectId, teacherId, schedule, roomNumber } = req.body;
      const classObj = await Class.findByPk(req.params.id);
      if (!classObj) return res.status(404).json({ error: 'Class not found' });
      await classObj.update({ subjectId, teacherId, schedule, roomNumber });
      res.json(classObj);
    } catch (err) {
      res.status(400).json({ error: 'Failed to update class' });
    }
  },

  // Delete class
  async delete(req, res) {
    try {
      const classObj = await Class.findByPk(req.params.id);
      if (!classObj) return res.status(404).json({ error: 'Class not found' });
      await classObj.destroy();
      res.json({ message: 'Class deleted' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete class' });
    }
  },

  // Assign teacher to class
  async assignTeacher(req, res) {
    try {
      const { teacherId } = req.body;
      const classObj = await Class.findByPk(req.params.id);
      if (!classObj) return res.status(404).json({ error: 'Class not found' });
      classObj.teacherId = teacherId;
      await classObj.save();
      res.json({ message: 'Teacher assigned', class: classObj });
    } catch (err) {
      res.status(400).json({ error: 'Failed to assign teacher' });
    }
  },

  // Assign students to class
  async assignStudents(req, res) {
    try {
      const { studentIds } = req.body; // array of student IDs
      const classObj = await Class.findByPk(req.params.id);
      if (!classObj) return res.status(404).json({ error: 'Class not found' });
      await Student.update(
        { classId: classObj.id },
        { where: { id: studentIds } }
      );
      res.json({ message: 'Students assigned to class' });
    } catch (err) {
      res.status(400).json({ error: 'Failed to assign students' });
    }
  },

  // Get class schedule
  async getSchedule(req, res) {
    try {
      const classObj = await Class.findByPk(req.params.id);
      if (!classObj) return res.status(404).json({ error: 'Class not found' });
      res.json({ schedule: classObj.schedule, roomNumber: classObj.roomNumber });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch schedule' });
    }
  }
};
