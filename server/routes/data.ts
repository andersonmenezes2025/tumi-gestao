import { Router } from 'express';
import { executeQuery } from '../config/database.js';
import { AuthenticatedRequest, authenticateToken, requireCompany } from '../middleware/auth.js';

const router = Router();

// Generic GET route for tables with company filtering
router.get('/:table', authenticateToken, requireCompany, async (req: AuthenticatedRequest, res) => {
  try {
    const { table } = req.params;
    const { select, eq, order, limit } = req.query;
    
    // Lista de tabelas permitidas
    const allowedTables = [
      'products', 'customers', 'sales', 'sale_items', 'quotes', 'quote_items',
      'accounts_receivable', 'accounts_payable', 'agenda_events', 'suppliers',
      'product_categories', 'product_purchases', 'companies', 'integrations',
      'automation_flows', 'automation_logs', 'ai_insights', 'marketing_campaigns',
      'crm_leads', 'online_quotes', 'online_quote_items', 'product_units'
    ];

    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: 'Tabela não permitida' });
    }

    let query = `SELECT * FROM ${table}`;
    const params: any[] = [];

    // Filtrar por empresa (exceto para profiles e companies)
    if (!['profiles', 'companies'].includes(table)) {
      query += ` WHERE company_id = $1`;
      params.push(req.user!.company_id);
    } else if (table === 'profiles') {
      query += ` WHERE id = $1`;
      params.push(req.user!.id);
    } else if (table === 'companies') {
      query += ` WHERE id = $1`;
      params.push(req.user!.company_id);
    }

    // Adicionar filtros adicionais
    if (eq && typeof eq === 'string') {
      const [column, value] = eq.split('.');
      const paramIndex = params.length + 1;
      
      if (params.length === 0) {
        query += ` WHERE ${column} = $${paramIndex}`;
      } else {
        query += ` AND ${column} = $${paramIndex}`;
      }
      params.push(value);
    }

    // Adicionar ordenação
    if (order && typeof order === 'string') {
      query += ` ORDER BY ${order}`;
    }

    // Adicionar limite
    if (limit && typeof limit === 'string') {
      query += ` LIMIT ${parseInt(limit)}`;
    }

    const result = await executeQuery(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('GET data error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Generic POST route for inserting data
router.post('/:table', authenticateToken, requireCompany, async (req: AuthenticatedRequest, res) => {
  try {
    const { table } = req.params;
    const data = req.body;

    const allowedTables = [
      'products', 'customers', 'sales', 'sale_items', 'quotes', 'quote_items',
      'accounts_receivable', 'accounts_payable', 'agenda_events', 'suppliers',
      'product_categories', 'product_purchases', 'integrations',
      'automation_flows', 'marketing_campaigns', 'crm_leads', 'product_units'
    ];

    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: 'Tabela não permitida' });
    }

    // Adicionar company_id automaticamente
    if (!['profiles'].includes(table)) {
      data.company_id = req.user!.company_id;
    }

    // Preparar a query de inserção
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map((_, index) => `$${index + 1}`);

    const query = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    const result = await executeQuery(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('POST data error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Generic PUT route for updating data
router.put('/:table/:id', authenticateToken, requireCompany, async (req: AuthenticatedRequest, res) => {
  try {
    const { table, id } = req.params;
    const data = req.body;

    const allowedTables = [
      'products', 'customers', 'sales', 'sale_items', 'quotes', 'quote_items',
      'accounts_receivable', 'accounts_payable', 'agenda_events', 'suppliers',
      'product_categories', 'product_purchases', 'companies', 'integrations',
      'automation_flows', 'marketing_campaigns', 'crm_leads', 'product_units'
    ];

    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: 'Tabela não permitida' });
    }

    // Remover campos que não devem ser atualizados
    delete data.id;
    delete data.created_at;
    if (!['companies'].includes(table)) {
      delete data.company_id;
    }

    // Adicionar updated_at
    data.updated_at = new Date().toISOString();

    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((col, index) => `${col} = $${index + 1}`);

    let whereClause = `id = $${columns.length + 1}`;
    const params = [...values, id];

    // Adicionar filtro por empresa
    if (!['profiles', 'companies'].includes(table)) {
      whereClause += ` AND company_id = $${columns.length + 2}`;
      params.push(req.user!.company_id);
    }

    const query = `
      UPDATE ${table}
      SET ${setClause.join(', ')}
      WHERE ${whereClause}
      RETURNING *
    `;

    const result = await executeQuery(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('PUT data error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Generic DELETE route
router.delete('/:table/:id', authenticateToken, requireCompany, async (req: AuthenticatedRequest, res) => {
  try {
    const { table, id } = req.params;

    const allowedTables = [
      'products', 'customers', 'sales', 'sale_items', 'quotes', 'quote_items',
      'accounts_receivable', 'accounts_payable', 'agenda_events', 'suppliers',
      'product_categories', 'product_purchases', 'integrations',
      'automation_flows', 'marketing_campaigns', 'crm_leads', 'product_units'
    ];

    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: 'Tabela não permitida' });
    }

    let whereClause = `id = $1`;
    const params = [id];

    // Adicionar filtro por empresa
    if (!['profiles'].includes(table)) {
      whereClause += ` AND company_id = $2`;
      params.push(req.user!.company_id);
    }

    const query = `DELETE FROM ${table} WHERE ${whereClause} RETURNING *`;
    const result = await executeQuery(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    res.json({ message: 'Registro excluído com sucesso' });
  } catch (error) {
    console.error('DELETE data error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;