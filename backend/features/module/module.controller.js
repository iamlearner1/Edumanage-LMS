const moduleService = require('./module.service');

exports.createModule = async (req, res) => {
  try {
    const module = await moduleService.createModule(req.body);
    res.status(201).json(module);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getModules = async (req, res) => {
  try {
    const result = await moduleService.getModules(req.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getModuleById = async (req, res) => {
  try {
    const module = await moduleService.getModuleById(req.params.id);
    if (!module) return res.status(404).json({ error: 'Module not found' });
    res.json(module);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const module = await moduleService.updateModule(req.params.id, req.body);
    if (!module) return res.status(404).json({ error: 'Module not found' });
    res.json(module);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const module = await moduleService.deleteModule(req.params.id);
    if (!module) return res.status(404).json({ error: 'Module not found' });
    res.json({ message: 'Module deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.togglePublishStatus = async (req, res) => {
  try {
    const module = await moduleService.togglePublishStatus(req.params.id, req.body.isPublished);
    if (!module) return res.status(404).json({ error: 'Module not found' });
    res.json(module);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
