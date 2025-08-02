const { Material, Subject, User } = require('../../models');
const { Op } = require('sequelize');

class MaterialController {
  /**
   * List all materials with pagination and filtering
   * GET /materials
   */
  async list(req, res) {
    try {
      const { page = 1, limit = 10, search, subjectId, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
      
      const offset = (page - 1) * limit;
      
      // Build where clause
      const whereClause = {};
      
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }
      
      if (subjectId) {
        whereClause.subjectId = subjectId;
      }

      // Get materials with pagination and includes
      const { count, rows: materials } = await Material.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Subject,
            as: 'Subject',
            attributes: ['id', 'name', 'description']
          },
          {
            model: User,
            as: 'CreatedBy',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        message: 'Materials retrieved successfully',
        data: materials,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: totalPages
        }
      });

    } catch (error) {
      console.error('List materials error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get material by ID
   * GET /materials/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      const material = await Material.findByPk(id, {
        include: [
          {
            model: Subject,
            as: 'Subject',
            attributes: ['id', 'name', 'description']
          },
          {
            model: User,
            as: 'CreatedBy',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Material not found',
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json({
        success: true,
        message: 'Material retrieved successfully',
        data: material
      });

    } catch (error) {
      console.error('Get material by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Create new material
   * POST /materials
   */
  async create(req, res) {
    try {
      const { title, description, fileUrl, subjectId, type } = req.body;
      const createdById = req.user.id; // From authentication middleware

      // Validate required fields
      if (!title || !description || !subjectId) {
        return res.status(400).json({
          success: false,
          message: 'Required fields missing',
          errors: [
            { field: 'title', message: 'Title is required' },
            { field: 'description', message: 'Description is required' },
            { field: 'subjectId', message: 'Subject is required' }
          ]
        });
      }

      // Validate subject exists
      const subject = await Subject.findByPk(subjectId);
      if (!subject) {
        return res.status(400).json({
          success: false,
          message: 'Subject not found',
          errors: [{ field: 'subjectId', message: 'Invalid subject' }]
        });
      }

      // Create material
      const material = await Material.create({
        title,
        description,
        fileUrl: fileUrl || null,
        subjectId,
        type: type || 'document',
        createdById
      });

      // Get the complete material data with includes
      const completeMaterial = await Material.findByPk(material.id, {
        include: [
          {
            model: Subject,
            as: 'Subject',
            attributes: ['id', 'name', 'description']
          },
          {
            model: User,
            as: 'CreatedBy',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Material created successfully',
        data: completeMaterial
      });

    } catch (error) {
      console.error('Create material error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update material
   * PUT /materials/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, fileUrl, subjectId, type } = req.body;

      // Find material
      const material = await Material.findByPk(id);
      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Material not found',
          timestamp: new Date().toISOString()
        });
      }

      // Check if user is the creator or has admin privileges
      if (material.createdById !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'You can only update materials you created',
          timestamp: new Date().toISOString()
        });
      }

      // Validate subject exists if provided
      if (subjectId) {
        const subject = await Subject.findByPk(subjectId);
        if (!subject) {
          return res.status(400).json({
            success: false,
            message: 'Subject not found',
            errors: [{ field: 'subjectId', message: 'Invalid subject' }]
          });
        }
      }

      // Prepare update data
      const updateData = {};
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (fileUrl !== undefined) updateData.fileUrl = fileUrl;
      if (subjectId) updateData.subjectId = subjectId;
      if (type) updateData.type = type;

      // Update material
      await material.update(updateData);

      // Get updated material data
      const updatedMaterial = await Material.findByPk(id, {
        include: [
          {
            model: Subject,
            as: 'Subject',
            attributes: ['id', 'name', 'description']
          },
          {
            model: User,
            as: 'CreatedBy',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Material updated successfully',
        data: updatedMaterial
      });

    } catch (error) {
      console.error('Update material error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Delete material
   * DELETE /materials/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Find material
      const material = await Material.findByPk(id);
      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Material not found',
          timestamp: new Date().toISOString()
        });
      }

      // Check if user is the creator or has admin privileges
      if (material.createdById !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'You can only delete materials you created',
          timestamp: new Date().toISOString()
        });
      }

      // Delete material
      await material.destroy();

      res.status(200).json({
        success: true,
        message: 'Material deleted successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Delete material error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new MaterialController(); 