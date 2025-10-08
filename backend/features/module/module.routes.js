const express = require('express');
const router = express.Router();
const moduleController = require('./module.controller');
const {
  getModulesValidator,
  createModuleValidator,
  updateModuleValidator,
  togglePublishValidator
} = require('./module.validation');

// Create Module
router.post(
  '/',
  createModuleValidator,
  moduleController.createModule
);

// Get all Modules
router.get(
  '/',
  getModulesValidator,
  moduleController.getModules
);

// Get Module by ID
router.get('/:id', moduleController.getModuleById);

// Update Module
router.put(
  '/:id',
  updateModuleValidator,
  moduleController.updateModule
);

// Delete Module
router.delete('/:id', moduleController.deleteModule);

// Toggle Publish status
router.patch(
  '/:id/publish',
  togglePublishValidator,
  moduleController.togglePublishStatus
);

module.exports = router;
