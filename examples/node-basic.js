const { SowasitClient } = require('../dist/cjs/index.js');
require('dotenv').config({ path: '../.env.local' });

async function main() {
  const client = new SowasitClient({
    baseUrl: process.env.SOWASIT_API_URL || 'http://localhost:3001',
    apiKey: process.env.SOWASIT_API_KEY,
  });

  try {
    console.log('🔐 1. Creating a new blockchain chain...');
    const chainId = 'demo-chain-' + Date.now();
    const chain = await client.chains.create(chainId, 'My Demo Blockchain', {
      description: 'A simple demo chain',
      visibility: 'public',
      type: 'data',
    });
    console.log('✅ Chain created:', {
      id: chain.id,
      name: chain.name,
      created_at: chain.created_at,
    });

    console.log('\n📝 2. Adding a block to the chain...');
    const block = await client.blocks.create(chain.id, {
      message: 'Hello SoWasIt!',
      timestamp: new Date().toISOString(),
      data: {
        username: 'demo-user',
        action: 'first_block',
        temperature: 23.5,
      },
    });
    console.log('✅ Block created:', {
      id: block.id,
      hash: block.hash.substring(0, 16) + '...',
      created_at: block.created_at,
    });

    console.log('\n🔎 3. Verifying the chain...');
    const retrievedChain = await client.chains.get(chain.id);
    console.log('✅ Chain verified:', {
      name: retrievedChain.name,
      type: retrievedChain.type,
      visibility: retrievedChain.visibility,
    });

    console.log('\n📦 4. Retrieving the block we just created...');
    const retrievedBlock = await client.blocks.get(chain.id, block.id);
    console.log('✅ Block retrieved:', {
      id: retrievedBlock.id,
      hash: retrievedBlock.hash.substring(0, 16) + '...',
      data: retrievedBlock.data,
    });

    console.log('\n✨ Demo complete! Your blockchain is working.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
