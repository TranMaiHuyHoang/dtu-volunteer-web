const Project = require('../models/project.model');
const createProject = async (projectData, createdById) => {
    projectData.createdBy = createdById; 
    
    // Chỉ ném lỗi, không bắt
    const project = new Project(projectData);
    await project.save();
    return project;

};


module.exports = { createProject };