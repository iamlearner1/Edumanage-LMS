const Module = require('./Module');

exports.createModule = async (data) => {
  return await Module.create(data);
};

exports.getModules = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};
  if (query.course) filter.course = query.course;
  if (query.isPublished !== undefined) filter.isPublished = query.isPublished;

  const modules = await Module.find(filter).skip(skip).limit(limit);
  const total = await Module.countDocuments(filter);

  return { modules, total, page, limit };
};

exports.getModuleById = async (id) => {
  return await Module.findById(id);
};

exports.updateModule = async (id, data) => {
  return await Module.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteModule = async (id) => {
  return await Module.findByIdAndDelete(id);
};

exports.togglePublishStatus = async (id, status) => {
  return await Module.findByIdAndUpdate(id, { $set: { isPublished: status } }, { new: true });
};
