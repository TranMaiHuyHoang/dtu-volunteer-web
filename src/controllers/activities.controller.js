import Project from "../models/project.model.js";

export const getAllActivities = async (req, res) => {
    try {
        const activities = await Project.find();

        res.json({
            status: "success",
            total: activities.length,
            data: activities
        });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

export const registerForActivity = async (req, res) => {
  try {
    const { activityId } = req.params;

    res.json({
      status: "success",
      message: `Đăng ký hoạt động ${activityId} thành công (sample tạm).`
    });

  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const listActivityRegistrations = async (req, res) => {
  try {
    const { activityId } = req.params;

    res.json({
      status: "success",
      message: `Danh sách đăng ký của hoạt động ${activityId} (sample).`,
      data: []
    });

  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};