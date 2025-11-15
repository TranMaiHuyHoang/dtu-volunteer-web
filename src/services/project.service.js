// project.service.js - SỬA LỖI EXPORT

import Project from '../models/project.model.js';
const createProject = async (projectData, createdById) => {
    projectData.createdBy = createdById; 
    
    // Chỉ ném lỗi, không bắt
    const project = new Project(projectData);
    await project.save();
    return project;

};


// Thay đổi từ Named Export sang Default Export
export default createProject; 
// export { createProject }; // Xóa dòng này