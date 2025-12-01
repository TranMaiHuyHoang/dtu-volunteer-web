import OrganizerProfile from '../models/organizerProfile.model.js';
async function createOrganizerProfile(newProfile) {
  // Xử lý dữ liệu và tạo mới hồ sơ tổ chức
  const createdProfile = new OrganizerProfile(newProfile);
  await createdProfile.save();
  return createdProfile;
}
async function getAllOrganizerProfiles() {
    // 💡 Sử dụng phương thức .find() của Mongoose để lấy tất cả các tài liệu.
    // Trong môi trường thực tế, bạn nên xem xét việc thêm các tùy chọn như 
    // .sort(), .limit(), và .skip() cho tính năng phân trang (pagination).
    const profiles = await OrganizerProfile.find();
    return profiles;
}
export { createOrganizerProfile, getAllOrganizerProfiles };
