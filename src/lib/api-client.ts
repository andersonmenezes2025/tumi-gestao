// API Client para substituir o Supabase
class QueryBuilder {
  private table: string;
  private client: ApiClient;
  private _select: string = '*';
  private _filters: Record<string, any> = {};
  private _order: string | undefined;
  private _limit: number | undefined;
  private _single: boolean = false;

  constructor(table: string, client: ApiClient) {
    this.table = table;
    this.client = client;
  }

  select(columns: string = '*') {
    this._select = columns;
    return this;
  }

  eq(column: string, value: any) {
    this._filters[column] = value;
    return this;
  }

  gte(column: string, value: any) {
    this._filters[`${column}_gte`] = value;
    return this;
  }

  lte(column: string, value: any) {
    this._filters[`${column}_lte`] = value;
    return this;
  }

  order(column: string, options: any = {}) {
    this._order = options.ascending === false ? `${column} DESC` : `${column} ASC`;
    return this;
  }

  limit(count: number) {
    this._limit = count;
    return this;
  }

  insert(data: any) {
    return new InsertBuilder(this.table, this.client, data);
  }

  update(data: any) {
    return new UpdateBuilder(this.table, this.client, data);
  }

  delete() {
    return new DeleteBuilder(this.table, this.client);
  }

  single() {
    this._single = true;
    return this._execute();
  }

  maybeSingle() {
    this._single = true;
    return this._execute();
  }

  // Fazer isso retornar uma Promise real
  private async _execute() {
    let endpoint = `/data/${this.table}`;
    const params = new URLSearchParams();

    if (this._select !== '*') {
      params.append('select', this._select);
    }

    Object.entries(this._filters).forEach(([key, value]) => {
      params.append('eq', `${key}.${value}`);
    });

    if (this._order) {
      params.append('order', this._order);
    }

    if (this._limit) {
      params.append('limit', this._limit.toString());
    }

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    try {
      const data = await this.client.request(endpoint);
      const result = this._single ? data[0] : data;
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Método then que retorna Promise real
  then<T>(onfulfilled?: (value: any) => T | PromiseLike<T>, onrejected?: (reason: any) => T | PromiseLike<T>): Promise<T> {
    return this._execute().then(onfulfilled, onrejected);
  }

  catch(onrejected?: (reason: any) => any): Promise<any> {
    return this._execute().catch(onrejected);
  }
}

class InsertBuilder {
  private table: string;
  private client: ApiClient;
  private data: any;
  private _select: string = '*';
  private _single: boolean = false;

  constructor(table: string, client: ApiClient, data: any) {
    this.table = table;
    this.client = client;
    this.data = data;
  }

  select(columns?: string) {
    this._select = columns || '*';
    return this;
  }

  single() {
    this._single = true;
    return this._execute();
  }

  private async _execute() {
    try {
      const result = await this.client.request(`/data/${this.table}`, {
        method: 'POST',
        body: JSON.stringify(this.data),
      });
      return { data: this._single ? result : [result], error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  then<T>(onfulfilled?: (value: any) => T | PromiseLike<T>, onrejected?: (reason: any) => T | PromiseLike<T>): Promise<T> {
    return this._execute().then(onfulfilled, onrejected);
  }

  catch(onrejected?: (reason: any) => any): Promise<any> {
    return this._execute().catch(onrejected);
  }
}

class UpdateBuilder {
  private table: string;
  private client: ApiClient;
  private data: any;
  private _filters: Record<string, any> = {};
  private _select: string = '*';
  private _single: boolean = false;

  constructor(table: string, client: ApiClient, data: any) {
    this.table = table;
    this.client = client;
    this.data = data;
  }

  eq(column: string, value: any) {
    this._filters[column] = value;
    return this;
  }

  select(columns?: string) {
    this._select = columns || '*';
    return this;
  }

  single() {
    this._single = true;
    return this._execute();
  }

  private async _execute() {
    try {
      const id = this._filters.id || Object.values(this._filters)[0];
      const result = await this.client.request(`/data/${this.table}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(this.data),
      });
      return { data: this._single ? result : [result], error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  then<T>(onfulfilled?: (value: any) => T | PromiseLike<T>, onrejected?: (reason: any) => T | PromiseLike<T>): Promise<T> {
    return this._execute().then(onfulfilled, onrejected);
  }

  catch(onrejected?: (reason: any) => any): Promise<any> {
    return this._execute().catch(onrejected);
  }
}

class DeleteBuilder {
  private table: string;
  private client: ApiClient;
  private _filters: Record<string, any> = {};

  constructor(table: string, client: ApiClient) {
    this.table = table;
    this.client = client;
  }

  eq(column: string, value: any) {
    this._filters[column] = value;
    return this;
  }

  private async _execute() {
    try {
      const id = this._filters.id || Object.values(this._filters)[0];
      await this.client.request(`/data/${this.table}/${id}`, {
        method: 'DELETE',
      });
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  then<T>(onfulfilled?: (value: any) => T | PromiseLike<T>, onrejected?: (reason: any) => T | PromiseLike<T>): Promise<T> {
    return this._execute().then(onfulfilled, onrejected);
  }

  catch(onrejected?: (reason: any) => any): Promise<any> {
    return this._execute().catch(onrejected);
  }
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = import.meta.env.MODE === 'production' 
      ? 'https://tumihortifruti.com.br/gestao'
      : 'http://localhost:3001';
    
    // Recuperar token do localStorage na inicialização
    this.token = localStorage.getItem('token');
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('API Request error:', error);
      throw error;
    }
  }

  // Direct HTTP methods for simpler usage
  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data?: any) {
    const body = data ? JSON.stringify(data) : undefined;
    return this.request(endpoint, { method: 'POST', body });
  }

  async put(endpoint: string, data?: any) {
    const body = data ? JSON.stringify(data) : undefined;
    return this.request(endpoint, { method: 'PUT', body });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Auth methods
  auth = {
    signUp: async (credentials: { email: string; password: string; fullName?: string }) => {
      const response = await this.request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      if (response.token) {
        this.token = response.token;
        localStorage.setItem('token', response.token);
      }
      
      return { data: { user: response.user, session: response.session }, error: null };
    },

    signInWithPassword: async (credentials: { email: string; password: string }) => {
      const response = await this.request('/auth/signin', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      if (response.token) {
        this.token = response.token;
        localStorage.setItem('token', response.token);
      }
      
      return { data: { user: response.user, session: response.session }, error: null };
    },

    getSession: async () => {
      if (!this.token) {
        return { data: { session: null }, error: null };
      }

      try {
        const response = await this.request('/auth/session');
        return { data: { session: response.session }, error: null };
      } catch (error) {
        // Token inválido, limpar
        this.token = null;
        localStorage.removeItem('token');
        return { data: { session: null }, error: null };
      }
    },

    signOut: async () => {
      await this.request('/auth/signout', { method: 'POST' });
      this.token = null;
      localStorage.removeItem('token');
      return { error: null };
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Criar uma função que mantém o contexto correto
      const checkAuth = async () => {
        const { data } = await this.auth.getSession();
        callback('INITIAL_SESSION', data.session);
      };

      checkAuth();

      // Retornar um objeto subscription-like
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              // Placeholder para compatibilidade
            }
          }
        }
      };
    },

    getUser: async () => {
      try {
        const response = await this.request('/auth/session');
        return { data: { user: response.user }, error: null };
      } catch (error) {
        return { data: { user: null }, error: error };
      }
    },

    updateUser: async (updates: any) => {
      // Placeholder para compatibilidade - implementar se necessário
      return { data: null, error: { message: 'Not implemented' } };
    }
  };

  // Database methods
  from(table: string) {
    return new QueryBuilder(table, this);
  }

  // Storage placeholder
  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        // Placeholder - implementar upload de arquivos se necessário
        return { data: null, error: { message: 'Storage not implemented' } };
      },
      getPublicUrl: (path: string) => {
        return { data: { publicUrl: '' } };
      }
    })
  };

  // Functions placeholder
  functions = {
    invoke: async (name: string, options?: any) => {
      // Placeholder - implementar funções se necessário
      return { data: null, error: { message: 'Functions not implemented' } };
    }
  };

  // RPC placeholder
  rpc = async (name: string, params?: any) => {
    // Placeholder - implementar RPC se necessário
    return { data: null, error: { message: 'RPC not implemented' } };
  };
}

export const apiClient = new ApiClient();

// Manter compatibilidade com código existente
export { apiClient as supabase };