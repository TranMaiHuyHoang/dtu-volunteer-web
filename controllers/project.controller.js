const Project = require('../models/project.model');
const projectService = require('../services/project.service');
const createProjectHandler = async (req, res, next) => {
  try {
    const projectData = req.body;

    const createdById = req.user.sub;

    const project = await projectService.createProject(projectData, createdById);

    res.status(201).json({
      message: 'Tạo dự án thành công',
      project
    });
  } catch (err) {
    next(err);
  }
};

exports.listProjects = async (req, res) => {
  try {
    const { status, q, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (q) filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { location: { $regex: q, $options: 'i' } }
    ];
    const projects = await Project.find(filter)
      .populate('createdBy', 'name email role')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    res.json({ data: projects, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('createdBy', 'name email');
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });

    // nếu muốn chỉ owner hoặc admin sửa, check:
    if (String(project.createdBy) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền sửa dự án này' });
    }

    Object.assign(project, req.body);
    await project.save();
    res.json({ message: 'Cập nhật thành công', project });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });

    if (String(project.createdBy) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền xóa dự án này' });
    }

    await project.remove();
    res.json({ message: 'Xóa dự án thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createProjectHandler
};