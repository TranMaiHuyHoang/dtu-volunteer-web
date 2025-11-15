// registration.controller.js - SỬ DỤNG ESM

// Thay thế require bằng import (Default Export cho Mongoose Models)
import Project from '../models/project.model.js';
import Registration from '../models/registration.model.js';

// Thay thế require bằng import (Default Export cho service)
import registrationService from '../services/registration.service.js';

// Thay thế require bằng import (Default Export cho logger)
import loggerInstance from '../config/logger.js';
const logger = loggerInstance;


const registerForProjectHandler = async (req, res, next) => {
    try {
        const { projectId } = req.body;
        const userId = req.user.sub; // Lấy ID từ thuộc tính JWT đã gán

        logger.debug(`Kiểm tra dữ liệu: ProjectID=${projectId} | UserID=${userId}`);
        
        // Sử dụng service đã import
        const reg = await registrationService.registerForProject(projectId, userId);

        res.status(201).json({
            message: 'Đăng ký thành công',
            reg
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Lấy danh sách đăng ký của một dự án
 * * @param {Object} req - yêu cầu
 * @param {Object} res - phản hồi
 * @param {string} req.params.projectId - ID của dự án
 * * @return {Object} - danh sách đăng ký của dự án
 * * @throws {Error} - Lỗi xảy ra khi thực hiện
 */
const listRegistrationsForProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        // Sử dụng Model đã import
        const regs = await Registration.find({ projectId }).populate('userId', 'name email');
        res.json(regs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const listMyRegistrations = async (req, res) => {
    try {
        // Sử dụng Model đã import
        const regs = await Registration.find({ userId: req.user.sub }).populate('projectId', 'title location startDate');
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

        // Sử dụng Model đã import
        const reg = await Registration.findById(id);
        if (!reg) return res.status(404).json({ message: 'Không tìm thấy đăng ký' });

        // Sử dụng Model đã import
        const project = await Project.findById(reg.projectId);
        if (!project) return res.status(404).json({ message: 'Dự án không tồn tại' });

        const isOwner = String(project.createdBy) === String(req.user.sub);
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


// Named Export (Đã đúng)
export {
    registerForProjectHandler,
    listRegistrationsForProject,
    listMyRegistrations,
    updateRegistrationStatus,
}