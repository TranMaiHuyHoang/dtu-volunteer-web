const financeModel = require('../models/finance.model');

exports.getUserFinance = async (req, res) => {
  try {
    const user = await financeModel.getFinanceUser(req.params.mongoUserId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addTransaction = async (req, res) => {
  try {
    const { userId, amount, type, description } = req.body;
    await financeModel.addTransaction(userId, amount, type, description);
    res.json({ message: 'Transaction recorded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
