import userService from '../../src/services/userService.js';

const register = (req, res) => {
  const { name, email, password } = req.body;
  const user = userService.registerUser(name, email, password);
  if (!user) return res.status(400).json({ error: 'Email já cadastrado' });
  res.status(201).json({ user });
};

const login = (req, res) => {
  const { email, password } = req.body;
  const result = userService.authenticate(email, password);
  if (!result) return res.status(401).json({ error: 'Credenciais inválidas' });
  res.json(result);
};

export default {
  register,
  login
};
