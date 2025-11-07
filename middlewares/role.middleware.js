module.exports = function permit(...allowedRoles) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện chức năng này' });
    }
    next();
  };
};
