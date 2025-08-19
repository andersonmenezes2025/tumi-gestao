import { Router, Request } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Verificar se usuário já existe
    const existingUser = await executeQuery(
      'SELECT id FROM profiles WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário
    const userResult = await executeQuery(`
      INSERT INTO profiles (id, email, full_name, role, created_at, updated_at, password_hash)
      VALUES (gen_random_uuid(), $1, $2, 'user', now(), now(), $3)
      RETURNING id, email, full_name, role, company_id
    `, [email, fullName || email.split('@')[0], hashedPassword]);

    const user = userResult.rows[0];

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        company_id: user.company_id
      },
      token,
      session: { access_token: token }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const userResult = await executeQuery(`
      SELECT id, email, full_name, role, company_id, password_hash
      FROM profiles 
      WHERE email = $1
    `, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = userResult.rows[0];

    // Verificar senha
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        company_id: user.company_id
      },
      token,
      session: { access_token: token }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get session
router.get('/session', authenticateToken, async (req: Request, res) => {
  try {
    res.json({
      user: req.user,
      session: { access_token: req.headers.authorization?.split(' ')[1] }
    });
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Sign out
router.post('/signout', (req, res) => {
  // Com JWT stateless, apenas confirma o logout
  res.json({ message: 'Logout realizado com sucesso' });
});

export default router;