import express from 'express';
import { Pool } from 'pg';
import { promises as fs } from 'fs';
import { join } from 'path';

const router = express.Router();

// Configuração do banco
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'tumigestao_db',
  user: process.env.DB_USER || 'tumigestao_user',
  password: process.env.DB_PASSWORD || 'TumiGest@o2024!Secure',
});

// Health check básico
router.get('/health', (req, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
    pid: process.pid
  };

  res.status(200).json(healthData);
});

// Health check detalhado
router.get('/health/detailed', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Verificar banco de dados
    const dbStart = Date.now();
    const dbResult = await pool.query('SELECT NOW() as current_time, version() as version');
    const dbTime = Date.now() - dbStart;

    // Verificar disco
    let diskInfo = null;
    try {
      const stats = await fs.stat(join(__dirname, '../../'));
      diskInfo = {
        accessible: true,
        lastModified: stats.mtime
      };
    } catch (error) {
      diskInfo = {
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      
      // Informações do sistema
      system: {
        memory: process.memoryUsage(),
        pid: process.pid,
        platform: process.platform,
        nodeVersion: process.version,
        cpuUsage: process.cpuUsage()
      },

      // Status do banco de dados
      database: {
        status: 'connected',
        responseTime: dbTime,
        serverTime: dbResult.rows[0].current_time,
        version: dbResult.rows[0].version.split(' ').slice(0, 2).join(' ')
      },

      // Status do sistema de arquivos
      filesystem: diskInfo
    };

    res.status(200).json(healthData);

  } catch (error) {
    const errorData = {
      status: 'error',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      
      // Informações básicas mesmo com erro
      system: {
        memory: process.memoryUsage(),
        pid: process.pid,
        uptime: Math.floor(process.uptime())
      },

      database: {
        status: 'error',
        error: error instanceof Error ? error.message : 'Database connection failed'
      }
    };

    res.status(503).json(errorData);
  }
});

// Health check só do banco
router.get('/health/db', async (req, res) => {
  try {
    const startTime = Date.now();
    const result = await pool.query(`
      SELECT 
        NOW() as current_time,
        version() as version,
        current_database() as database,
        current_user as user,
        (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') as table_count
    `);
    
    const responseTime = Date.now() - startTime;
    
    res.status(200).json({
      status: 'ok',
      responseTime,
      ...result.rows[0],
      connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER
      }
    });

  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Database connection failed',
      connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER
      }
    });
  }
});

// Liveness probe (Kubernetes style)
router.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
});

// Readiness probe (Kubernetes style)
router.get('/health/ready', async (req, res) => {
  try {
    // Verificar se pode conectar no banco
    await pool.query('SELECT 1');
    
    res.status(200).json({ 
      status: 'ready', 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'not_ready', 
      error: error instanceof Error ? error.message : 'Not ready',
      timestamp: new Date().toISOString() 
    });
  }
});

export default router;