
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
    return {
    displayName: user.displayName || user.username,
    email: user.email,
  };
}

const getProviderId = (user, provider) => {
  return provider === 'google' ? user.googleId : user.id;
}

const mapUserData = (user, provider = 'local') => {
  // Các trường chung
  const baseInfo = getBaseInfo(user);

  // Mỗi provider có id riêng

    const id = getProviderId(user, provider);

  // Tạo payload theo chuẩn JWT
  const payload = {
    sub: id,
    name: baseInfo.displayName,
    email: baseInfo.email,
    provider, // thêm để biết token từ đâu sinh ra
  };

  // Dữ liệu user trả về client
  const userInfo = formatUserInfo(user, provider);

  return { payload, userInfo };
};

module.exports = { formatUserInfo,mapUserData };
