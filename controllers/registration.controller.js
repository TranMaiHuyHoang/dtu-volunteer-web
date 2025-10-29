const { Project } = require('../models/project.model');
const { Registration } = require('../models/registration.model');

const registerForProject = async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ message: 'Thiếu projectId' });

    // kiểm tra project tồn tại
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Dự án không tồn tại' });

    // check unique: một user không đăng ký 2 lần cho 1 project
    const exists = await Registration.findOne({ projectId, userId: req.user._id });
    if (exists) return res.status(409).json({ message: 'Bạn đã đăng ký dự án này' });

    const reg = new Registration({
      projectId,
      userId: req.user._id,
      status: 'pending'
    });
    await reg.save();
    res.status(201).json({ message: 'Đăng ký thành công', reg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const listRegistrationsForProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const regs = await Registration.find({ projectId }).populate('userId', 'name email');
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const listMyRegistrations = async (req, res) => {
  try {
    const regs = await Registration.find({ userId: req.user._id }).populate('projectId', 'title location startDate');
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params; // registration id
    const { status } = req.body; // approved/rejected
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const reg = await Registration.findById(id);
    if (!reg) return res.status(404).json({ message: 'Không tìm thấy đăng ký' });

    // chỉ organizer (project owner) hoặc admin mới được duyệt
    const project = await Project.findById(reg.projectId);
    if (!project) return res.status(404).json({ message: 'Dự án không tồn tại' });

    const isOwner = String(project.createdBy) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền thay đổi trạng thái' });
    }

    reg.status = status;
    await reg.save();

    res.json({ message: 'Cập nhật trạng thái thành công', reg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
    registerForProject,
    listRegistrationsForProject,
    listMyRegistrations,
    updateRegistrationStatus,
}
