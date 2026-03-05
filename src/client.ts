import {
  SowasitConfig,
  Chain,
  Block,
  ApiKey,
  User,
  LoginResponse,
  RegisterResponse,
  ApiKeyResponse,
  ChainResponse,
  BlockResponse,
  ExportResponse,
} from './types';

export class SowasitClient {
  private baseUrl: string;
  private apiKey?: string;
  private token?: string;
  private timeout: number;

  constructor(config: SowasitConfig) {
    if (!config.baseUrl) {
      throw new Error('baseUrl is required in SowasitClient config');
    }
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
  }

  private getHeaders(useApiKey = false): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (useApiKey && this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    } else if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    method: string,
    path: string,
    data?: Record<string, any>,
    useApiKey = false
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const options: RequestInit = {
      method,
      headers: this.getHeaders(useApiKey),
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorData.error || `HTTP ${response.status}`
        );
      }

      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = undefined;
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    tenantName?: string
  ): Promise<RegisterResponse> {
    const response = await this.request<RegisterResponse>('/auth/register', 'POST', {
      email,
      password,
      firstName,
      lastName,
      tenantName: tenantName || `${firstName}'s workspace`,
    });

    if (response.token) {
      this.token = response.token;
    }

    return response;
  }

  async loginWithEmail(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/web/login', 'POST', {
      email,
      password,
    });

    if (response.token) {
      this.token = response.token;
    }

    return response;
  }

  async loginWithApiKey(apiKey: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>(
      '/auth/api/login',
      'POST',
      { api_key: apiKey },
      true
    );

    if (response.token) {
      this.token = response.token;
    }

    return response;
  }

  chains = {
    list: async (
      scope: 'tenant' | 'public' | 'all' = 'tenant',
      type?: 'data' | 'anchoring',
      page = 1,
      limit = 20
    ): Promise<Chain[]> => {
      const params = new URLSearchParams({
        scope,
        page: page.toString(),
        limit: limit.toString(),
      });

      if (type) {
        params.append('type', type);
      }

      const response = await this.request<ChainResponse>(
        `/chains?${params.toString()}`,
        'GET'
      );

      return Array.isArray(response.data) ? response.data : [];
    },

    create: async (
      id: string,
      name: string,
      options?: {
        description?: string;
        visibility?: 'private' | 'public';
        type?: 'data' | 'anchoring';
        anchoring_id?: string;
      }
    ): Promise<Chain> => {
      const response = await this.request<ChainResponse>('/chains', 'POST', {
        id,
        name,
        ...options,
      });

      if (!response.chain) {
        throw new Error('Failed to create chain');
      }

      return response.chain;
    },

    get: async (chainId: string): Promise<Chain> => {
      const response = await this.request<ChainResponse>(
        `/chains/${chainId}`,
        'GET'
      );

      if (!response.data || typeof response.data === 'object' && 'length' in response.data) {
        throw new Error('Chain not found');
      }

      return response.data as Chain;
    },

    export: async (chainId: string): Promise<ExportResponse['data']> => {
      const response = await this.request<ExportResponse>(
        `/chains/${chainId}/export`,
        'GET'
      );

      if (!response.data) {
        throw new Error('Failed to export chain');
      }

      return response.data;
    },
  };

  blocks = {
    list: async (
      chainId: string,
      limit = 50,
      offset = 0
    ): Promise<Block[]> => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await this.request<BlockResponse>(
        `/chains/${chainId}/blocks?${params.toString()}`,
        'GET'
      );

      return Array.isArray(response.data) ? response.data : [];
    },

    create: async (
      chainId: string,
      data: Record<string, any>
    ): Promise<Block> => {
      const response = await this.request<BlockResponse>(
        `/chains/${chainId}/blocks`,
        'POST',
        { data }
      );

      if (!response.block) {
        throw new Error('Failed to create block');
      }

      return response.block;
    },

    get: async (chainId: string, blockId: string): Promise<Block> => {
      const response = await this.request<BlockResponse>(
        `/chains/${chainId}/blocks/${blockId}`,
        'GET'
      );

      if (!response.data || typeof response.data === 'object' && 'length' in response.data) {
        throw new Error('Block not found');
      }

      return response.data as Block;
    },

    getLatest: async (chainId: string): Promise<Block> => {
      const response = await this.request<BlockResponse>(
        `/chains/${chainId}/blocks/latest`,
        'GET'
      );

      if (!response.data || typeof response.data === 'object' && 'length' in response.data) {
        throw new Error('No blocks found in chain');
      }

      return response.data as Block;
    },
  };

  apiKeys = {
    create: async (
      name: string,
      permissions?: string[],
      expiresIn?: number
    ): Promise<string> => {
      const response = await this.request<ApiKeyResponse>('/api-keys', 'POST', {
        name,
        permissions: permissions || ['read', 'write'],
        expiresIn,
      });

      if (!response.key) {
        throw new Error('Failed to create API key');
      }

      return response.key;
    },

    list: async (): Promise<ApiKey[]> => {
      const response = await this.request<{ success: boolean; data?: ApiKey[] }>(
        '/api-keys',
        'GET'
      );

      return response.data || [];
    },

    delete: async (id: string): Promise<boolean> => {
      const response = await this.request<{ success: boolean }>(
        `/api-keys/${id}`,
        'DELETE'
      );

      return response.success;
    },
  };

  health = async (): Promise<{ status: string; version: string }> => {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  };
}
