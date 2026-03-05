import React, { useState, useCallback } from 'react';
import { SowasitClient, Block } from '../dist/esm/index.js';

export function BlockchainExplorer() {
  const [apiUrl, setApiUrl] = useState('http://localhost:3001');
  const [apiKey, setApiKey] = useState('');
  const [client, setClient] = useState<SowasitClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('Ready. Click "Connect" to start.');
  const [currentChainId, setCurrentChainId] = useState<string | null>(null);
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);
  const [blockData, setBlockData] = useState('{}');

  const log = useCallback((message: string, isError = false) => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = isError ? '❌' : '✅';
    setOutput((prev) => `${prev}\n[${timestamp}] ${prefix} ${message}`);
  }, []);

  const handleConnect = useCallback(async () => {
    try {
      setLoading(true);
      const newClient = new SowasitClient({
        baseUrl: apiUrl,
        apiKey: apiKey || undefined,
      });

      await newClient.health();
      setClient(newClient);
      setConnected(true);
      log('✨ Connected! Ready to use.');
    } catch (error) {
      log(`Connection failed: ${(error as Error).message}`, true);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, apiKey, log]);

  const handleCreateChain = useCallback(async () => {
    if (!client) {
      log('Please connect first', true);
      return;
    }

    try {
      setLoading(true);
      log('🔐 Creating a new chain...');
      const chainId = 'demo-chain-' + Date.now();
      const chain = await client.chains.create(chainId, 'Demo Chain', {
        description: 'Created from React demo',
        visibility: 'public',
        type: 'data',
      });
      setCurrentChainId(chain.id);
      log(`Chain created: ${chain.id}`);
      log('Ready for next steps!');
    } catch (error) {
      log(`Failed to create chain: ${(error as Error).message}`, true);
    } finally {
      setLoading(false);
    }
  }, [client, log]);

  const handleAddBlock = useCallback(async () => {
    if (!client || !currentChainId) {
      log('Please create a chain first', true);
      return;
    }

    try {
      setLoading(true);
      log('📝 Adding a block...');
      let data = {};
      try {
        data = JSON.parse(blockData || '{}');
      } catch (e) {
        data = { message: blockData };
      }

      const block = await client.blocks.create(currentChainId, {
        timestamp: new Date().toISOString(),
        ...data,
      });
      setCurrentBlockId(block.id);
      log(`Block added: ${block.id.substring(0, 8)}...`);
      log('Ready to retrieve!');
    } catch (error) {
      log(`Failed to add block: ${(error as Error).message}`, true);
    } finally {
      setLoading(false);
    }
  }, [client, currentChainId, blockData, log]);

  const handleGetChain = useCallback(async () => {
    if (!client || !currentChainId) {
      log('Please create a chain first', true);
      return;
    }

    try {
      setLoading(true);
      log('🔎 Retrieving chain...');
      const chain = await client.chains.get(currentChainId);
      log(`Chain: ${chain.name}`);
      log(`Type: ${chain.type}, Visibility: ${chain.visibility}`);
      log(`Created: ${chain.created_at}`);
    } catch (error) {
      log(`Failed to get chain: ${(error as Error).message}`, true);
    } finally {
      setLoading(false);
    }
  }, [client, currentChainId, log]);

  const handleGetBlock = useCallback(async () => {
    if (!client || !currentChainId || !currentBlockId) {
      log('Please create and add a block first', true);
      return;
    }

    try {
      setLoading(true);
      log('📦 Retrieving block...');
      const block = await client.blocks.get(currentChainId, currentBlockId);
      log(`Block ID: ${block.id}`);
      log(`Hash: ${block.hash.substring(0, 16)}...`);
      log(`Data: ${JSON.stringify(block.data)}`);
      log(`Created: ${block.created_at}`);
    } catch (error) {
      log(`Failed to get block: ${(error as Error).message}`, true);
    } finally {
      setLoading(false);
    }
  }, [client, currentChainId, currentBlockId, log]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⛓️  SoWasIt Blockchain Explorer</h1>

      <div style={styles.section}>
        <h2>Connection</h2>
        <div style={styles.formGroup}>
          <label>API URL:</label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            disabled={connected}
            style={styles.input}
            placeholder="http://localhost:3001"
          />
        </div>

        <div style={styles.formGroup}>
          <label>API Key (optional):</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={connected}
            style={styles.input}
            placeholder="your_api_key"
          />
        </div>

        <button
          onClick={handleConnect}
          disabled={loading || connected}
          style={{
            ...styles.button,
            ...(connected ? styles.buttonDisabled : styles.buttonPrimary),
          }}
        >
          {connected ? '✓ Connected' : 'Connect'}
        </button>
      </div>

      {connected && (
        <>
          <div style={styles.section}>
            <h2>1. Create Blockchain Chain</h2>
            <button
              onClick={handleCreateChain}
              disabled={loading}
              style={{ ...styles.button, ...styles.buttonSecondary }}
            >
              🔐 Create Chain
            </button>
            {currentChainId && (
              <p style={styles.success}>Chain ID: {currentChainId}</p>
            )}
          </div>

          {currentChainId && (
            <div style={styles.section}>
              <h2>2. Add Block to Chain</h2>
              <div style={styles.formGroup}>
                <label>Block Data (JSON):</label>
                <input
                  type="text"
                  value={blockData}
                  onChange={(e) => setBlockData(e.target.value)}
                  style={styles.input}
                  placeholder='{"message": "hello", "value": 123}'
                />
              </div>
              <button
                onClick={handleAddBlock}
                disabled={loading}
                style={{ ...styles.button, ...styles.buttonSecondary }}
              >
                📝 Add Block
              </button>
              {currentBlockId && (
                <p style={styles.success}>Block ID: {currentBlockId}</p>
              )}
            </div>
          )}

          {currentChainId && (
            <div style={styles.section}>
              <h2>3 & 4. Retrieve Data</h2>
              <button
                onClick={handleGetChain}
                disabled={loading}
                style={{ ...styles.button, ...styles.buttonSecondary }}
              >
                🔎 Get Chain
              </button>
              <button
                onClick={handleGetBlock}
                disabled={loading || !currentBlockId}
                style={{ ...styles.button, ...styles.buttonSecondary }}
              >
                📦 Get Block
              </button>
            </div>
          )}
        </>
      )}

      <div style={styles.section}>
        <h2>Output</h2>
        <div style={styles.output}>{output}</div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  } as const,
  title: {
    color: '#667eea',
    marginBottom: '30px',
    fontSize: '32px',
  } as const,
  section: {
    marginBottom: '30px',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  } as const,
  formGroup: {
    marginBottom: '15px',
  } as const,
  input: {
    display: 'block',
    width: '100%',
    padding: '10px',
    marginTop: '5px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  } as const,
  button: {
    padding: '10px 20px',
    marginRight: '10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  } as const,
  buttonPrimary: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  } as const,
  buttonSecondary: {
    background: '#fff',
    color: '#667eea',
    border: '1px solid #667eea',
  } as const,
  buttonDisabled: {
    background: '#ccc',
    color: '#999',
    cursor: 'not-allowed',
  } as const,
  listContainer: {
    marginTop: '15px',
  } as const,
  listItem: {
    padding: '12px',
    marginBottom: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s',
  } as const,
  listItemSelected: {
    borderColor: '#667eea',
    backgroundColor: '#f0f0ff',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
  } as const,
  chainId: {
    fontSize: '12px',
    color: '#999',
    margin: '5px 0',
    fontFamily: 'monospace',
  } as const,
  chainType: {
    fontSize: '12px',
    color: '#666',
    margin: '5px 0',
  } as const,
  blockHash: {
    fontSize: '12px',
    color: '#999',
    margin: '5px 0',
    fontFamily: 'monospace',
  } as const,
  blockCreated: {
    fontSize: '12px',
    color: '#666',
    margin: '5px 0',
  } as const,
  success: {
    color: '#27ae60',
    fontSize: '13px',
    fontWeight: '600',
    margin: '10px 0 0 0',
  } as const,
  output: {
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '15px',
    height: '300px',
    overflow: 'auto',
    fontFamily: 'monospace',
    fontSize: '12px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  } as const,
};
