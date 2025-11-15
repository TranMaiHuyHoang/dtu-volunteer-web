
const formatUserInfo = (user, provider = 'local') => {
   const id = getProviderId(user, provider);
   const baseInfo = getBaseInfo(user);
   return {
       id,
       ...baseInfo,
       provider,
   };
}

const getBaseInfo = (user) => {
  const userRole = user.role || 'volunteer';
    return {
    displayName: user.displayName || user.username,
    email: user.email,
    role: userRole,
  };
}

const getProviderId = (user, provider) => {
  return provider === 'google' ? user.googleId : user.id;
}

const mapUserData = (user, provider = 'local') => {
  // Các trường chung
  const baseInfo = getBaseInfo(user);

  // Luôn dùng MongoDB ObjectId (_id) cho JWT sub, không dùng Google ID
  // Google ID chỉ là trường phụ (unique secondary index) để tìm user
  const mongoObjectId = user._id ? user._id.toString() : user.id;

  // Tạo payload theo chuẩn JWT
  const payload = {
    sub: mongoObjectId, // Luôn là MongoDB ObjectId
    name: baseInfo.displayName,
    email: baseInfo.email,
    role: baseInfo.role,
    provider, // thêm để biết token từ đâu sinh ra
  };

  // Dữ liệu user trả về client
  const userInfo = formatUserInfo(user, provider);

  return { payload, userInfo };
};

export { formatUserInfo,mapUserData };
