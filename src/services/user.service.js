import User from '../models/user.model.js'; 

const UserService = {
    /**
     * Tìm người dùng bằng ID
     * @param {string} userId 
     * @returns {Promise<any | null>} 
     */
    findById: async (userId) => {
        // Tìm User theo khóa chính (_id) và trả về đối tượng JS thuần
        const user = await User.findById(userId).lean();
        return user;
    }
};

export default UserService;