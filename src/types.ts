export interface SowasitConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

export interface Chain {
  id: string;
  name: string;
  description?: string;
  type: 'data' | 'anchoring';
  visibility: 'private' | 'public';
  tenant_id: string;
  created_at: string;
  updated_at: string;
  anchoring_id?: string;
}

export interface Block {
  id: string;
  chain_id: string;
  data: Record<string, any>;
  previous_hash: string;
  hash: string;
  created_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key_hash: string;
  permissions: string[];
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  last_used?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  active: boolean;
  created_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  type: 'personal' | 'organization';
  created_at: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  token?: string;
  user?: User;
  tenant?: Tenant;
  message?: string;
}

export interface ApiKeyResponse {
  success: boolean;
  key?: string;
  data?: ApiKey;
  message?: string;
}

export interface ChainResponse {
  success: boolean;
  chain?: Chain;
  data?: Chain | Chain[];
  message?: string;
}

export interface BlockResponse {
  success: boolean;
  block?: Block;
  data?: Block | Block[];
  message?: string;
}

export interface ExportResponse {
  success: boolean;
  data?: {
    chain: Chain;
    blocks: Block[];
    stats: {
      total_blocks: number;
      first_block_created: string;
      last_block_created: string;
    };
  };
  message?: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
  details?: Record<string, any>;
}
