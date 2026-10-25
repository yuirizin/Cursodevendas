import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { dbService } from './server/db.js';
import { User } from './src/types/index.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Ensure body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
const publicDir = path.resolve(process.cwd(), 'public');
const uploadsDir = path.join(publicDir, 'uploads');
const videosDir = path.join(uploadsDir, 'videos');
const imagesDir = path.join(uploadsDir, 'images');

if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

app.use('/uploads', express.static(uploadsDir));

// Multer storage for videos
const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, videosDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    const cleanName = `aula_zeus_${Date.now()}${ext}`;
    cb(null, cleanName);
  }
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
  fileFilter: (_req, _file, cb) => {
    cb(null, true);
  }
});

// Multer storage for images
const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, imagesDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const cleanName = `zeus_asset_${Date.now()}${ext}`;
    cb(null, cleanName);
  }
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos.'));
    }
  }
});

// In-memory active sessions mapping token -> User
interface Session {
  user: User;
  createdAt: number;
}
const sessions = new Map<string, Session>();

// Helper to sanitize user output
function sanitizeUser(u: { id: string; username: string; role: any; status: any; createdAt: string }): User {
  return {
    id: u.id,
    username: u.username,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt
  };
}

// Authentication Middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Autenticação necessária. Faça login para continuar.' });
  }

  const token = authHeader.split(' ')[1];
  const session = sessions.get(token);

  if (!session) {
    return res.status(401).json({ error: 'Sessão expirada ou inválida. Por favor, entre novamente.' });
  }

  // Refresh user state from database
  const currentUser = dbService.getUserById(session.user.id);
  if (!currentUser || currentUser.status === 'inativo') {
    sessions.delete(token);
    return res.status(403).json({ error: 'Conta inativa ou não encontrada.' });
  }

  (req as any).user = sanitizeUser(currentUser);
  (req as any).token = token;
  next();
}

// Admin-only Middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as User | undefined;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({
      error: 'Acesso negado: privilégios de administrador necessários para realizar esta operação.'
    });
  }
  next();
}

// ================= API ROUTES =================

// --- Auth Routes ---
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }

    const user = dbService.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique seu usuário e senha.' });
    }

    if (user.status === 'inativo') {
      return res.status(403).json({ error: 'Esta conta está inativa. Contate o administrador.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique seu usuário e senha.' });
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex');
    const sanitized = sanitizeUser(user);
    sessions.set(token, { user: sanitized, createdAt: Date.now() });

    return res.json({
      success: true,
      user: sanitized,
      token
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Erro interno ao autenticar usuário.' });
  }
});

app.get('/api/auth/me', authMiddleware, (req: Request, res: Response) => {
  return res.json({ user: (req as any).user });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    sessions.delete(token);
  }
  return res.json({ success: true, message: 'Sessão encerrada com sucesso.' });
});

app.post('/api/auth/change-password', authMiddleware, (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user.id;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
    }

    const user = dbService.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const isMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Senha atual incorreta.' });
    }

    dbService.resetUserPassword(userId, newPassword);
    return res.json({ success: true, message: 'Senha atualizada com sucesso!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao alterar senha.' });
  }
});

// --- Public/Student Content Route ---
app.get('/api/content/public', authMiddleware, (_req: Request, res: Response) => {
  try {
    const settings = dbService.getSettings();
    const modules = dbService.getModules(true);
    const prompts = dbService.getPrompts(true);
    const video = dbService.getVideo();

    return res.json({
      settings,
      modules,
      prompts,
      video: video.isPublished ? video : null
    });
  } catch (err: any) {
    console.error('Error fetching course content:', err);
    return res.status(500).json({ error: 'Erro ao carregar conteúdo do curso.' });
  }
});

// --- Admin Overview ---
app.get('/api/admin/overview', authMiddleware, requireAdmin, (_req: Request, res: Response) => {
  try {
    const users = dbService.getUsers();
    const modules = dbService.getModules(false);
    const prompts = dbService.getPrompts(false);
    const video = dbService.getVideo();
    const settings = dbService.getSettings();

    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === 'ativo').length,
      adminCount: users.filter((u) => u.role === 'admin').length,
      studentCount: users.filter((u) => u.role === 'aluno').length,
      totalModules: modules.length,
      publishedModules: modules.filter((m) => m.isPublished).length,
      totalPrompts: prompts.length,
      publishedPrompts: prompts.filter((p) => p.isPublished).length,
      hasVideo: !!video.filePath,
      videoPublished: video.isPublished,
      lastUpdated: settings.updatedAt
    };

    return res.json({ stats, video, settings });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao obter visão geral do sistema.' });
  }
});

// --- Admin Settings Routes ---
app.get('/api/admin/settings', authMiddleware, requireAdmin, (_req: Request, res: Response) => {
  return res.json({ settings: dbService.getSettings() });
});

app.put('/api/admin/settings', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = dbService.updateSettings(req.body);
    return res.json({ success: true, settings: updated, message: 'Configurações atualizadas com sucesso!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao atualizar configurações.' });
  }
});

// --- Admin Modules Routes ---
app.get('/api/admin/modules', authMiddleware, requireAdmin, (_req: Request, res: Response) => {
  return res.json({ modules: dbService.getModules(false) });
});

app.post('/api/admin/modules', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  try {
    const { title, description, fullContent, practicalTask, expectedResult, badge } = req.body;
    if (!title) return res.status(400).json({ error: 'O título da etapa é obrigatório.' });

    const existing = dbService.getModules(false);
    const nextOrder = existing.length + 1;

    const newMod = dbService.createModule({
      stepNumber: nextOrder,
      title,
      description: description || '',
      fullContent: fullContent || '',
      practicalTask: practicalTask || '',
      expectedResult: expectedResult || '',
      badge: badge || 'Nova Etapa',
      sortOrder: nextOrder,
      isPublished: true
    });

    return res.status(201).json({ success: true, module: newMod, message: 'Etapa criada com sucesso!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao criar etapa.' });
  }
});

app.put('/api/admin/modules/:id', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = dbService.updateModule(req.params.id, req.body);
    return res.json({ success: true, module: updated, message: 'Etapa atualizada com sucesso!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao atualizar etapa.' });
  }
});

app.delete('/api/admin/modules/:id', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  try {
    dbService.deleteModule(req.params.id);
    return res.json({ success: true, message: 'Etapa excluída com sucesso!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao excluir etapa.' });
  }
});

app.put('/api/admin/modules-reorder', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  try {
    const { orderIds } = req.body;
    if (!Array.isArray(orderIds)) return res.status(400).json({ error: 'Array orderIds é obrigatório.' });
    dbService.reorderModules(orderIds);
    return res.json({ success: true, modules: dbService.getModules(false) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao reordenar etapas.' });
  }
});

// --- Admin Prompts Routes ---
app.get('/api/admin/prompts', authMiddleware, requireAdmin, (_req: Request, res: Response) => {
  return res.json({ prompts: dbService.getPrompts(false) });
});

app.post('/api/admin/prompts', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  try {
    const { segmentName, description, promptContent, iconName } = req.body;
    if (!segmentName || !promptContent) {
      return res.status(400).json({ error: 'Segmento e conteúdo do prompt são obrigatórios.' });
    }

    const existing = dbService.getPrompts(false);
    const newPrompt = dbService.createPrompt({
      segmentName,
      description: description || '',
      promptContent,
      iconName: iconName || 'Code',
      sortOrder: existing.length + 1,
      isPublished: true
    });

    return res.status(201).json({ success: true, prompt: newPrompt, message: 'Prompt criado com sucesso!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao criar prompt.' });
  }
});

app.put('/api/admin/prompts/:id', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = dbService.updatePrompt(req.params.id, req.body);
    return res.json({ success: true, prompt: updated, message: 'Prompt atualizado com sucesso!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao atualizar prompt.' });
  }
});

app.delete('/api/admin/prompts/:id', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  try {
    dbService.deletePrompt(req.params.id);
    return res.json({ success: true, message: 'Prompt excluído com sucesso!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao excluir prompt.' });
  }
});

app.put('/api/admin/prompts-reorder', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  try {
    const { orderIds } = req.body;
    if (!Array.isArray(orderIds)) return res.status(400).json({ error: 'Array orderIds é obrigatório.' });
    dbService.reorderPrompts(orderIds);
    return res.json({ success: true, prompts: dbService.getPrompts(false) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao reordenar prompts.' });
  }
});

// --- Admin Video Routes ---
app.get('/api/admin/video', authMiddleware, requireAdmin, (_req: Request, res: Response) => {
  return res.json({ video: dbService.getVideo() });
});

app.put('/api/admin/video', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = dbService.updateVideo(req.body);
    return res.json({ success: true, video: updated, message: 'Dados do vídeo atualizados com sucesso!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao atualizar vídeo.' });
  }
});

app.post('/api/admin/video/upload', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  videoUpload.single('video')(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Falha no upload do arquivo MP4.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const relativePath = `/uploads/videos/${req.file.filename}`;
    const updated = dbService.updateVideo({
      filePath: relativePath,
      fileType: req.file.mimetype,
      isPublished: true
    });

    return res.json({
      success: true,
      video: updated,
      message: 'Vídeo MP4 enviado e publicado com sucesso!'
    });
  });
});

app.delete('/api/admin/video/file', authMiddleware, requireAdmin, (_req: Request, res: Response) => {
  try {
    dbService.deleteVideoFile();
    return res.json({ success: true, message: 'Vídeo removido com sucesso.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao remover vídeo.' });
  }
});

// --- Admin Image Upload Route ---
app.post('/api/admin/images/upload', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  imageUpload.single('image')(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Falha no envio da imagem.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem selecionada.' });
    }

    const relativePath = `/uploads/images/${req.file.filename}`;
    return res.json({
      success: true,
      filePath: relativePath,
      message: 'Imagem enviada com sucesso!'
    });
  });
});

// --- Admin Users Routes ---
app.get('/api/admin/users', authMiddleware, requireAdmin, (_req: Request, res: Response) => {
  const users = dbService.getUsers().map(sanitizeUser);
  return res.json({ users });
});

app.post('/api/admin/users', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve conter no mínimo 6 caracteres.' });
    }
    const newUser = dbService.createUser(username, password, role === 'admin' ? 'admin' : 'aluno');
    return res.status(201).json({
      success: true,
      user: sanitizeUser(newUser),
      message: `Usuário ${newUser.username} criado com sucesso!`
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Erro ao criar usuário.' });
  }
});

app.put('/api/admin/users/:id', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  try {
    const { role, status } = req.body;
    const updated = dbService.updateUser(req.params.id, { role, status });
    return res.json({ success: true, user: sanitizeUser(updated), message: 'Usuário atualizado com sucesso!' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Erro ao atualizar usuário.' });
  }
});

app.post('/api/admin/users/:id/reset-password', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }
    dbService.resetUserPassword(req.params.id, newPassword);
    return res.json({ success: true, message: 'Senha redefinida com sucesso!' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Erro ao redefinir senha.' });
  }
});

app.delete('/api/admin/users/:id', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  try {
    dbService.deleteUser(req.params.id);
    return res.json({ success: true, message: 'Usuário removido com sucesso!' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Erro ao excluir usuário.' });
  }
});

// Setup Vite in Dev or serve Static in Production
async function startServer() {
  await dbService.initialize();
  console.log('[ZEUS SITES IA] Banco de dados SQLite persistente inicializado com sucesso.');

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ZEUS SITES IA] Servidor rodando na porta ${PORT} (dev: ${!isProd})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
