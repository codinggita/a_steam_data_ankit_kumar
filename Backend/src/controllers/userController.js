// Sample Controller
const getUsers = (req, res) => {
  res.json({ message: 'Get all users' });
};

const createUser = (req, res) => {
  res.json({ message: 'User created' });
};

module.exports = {
  getUsers,
  createUser,
};
