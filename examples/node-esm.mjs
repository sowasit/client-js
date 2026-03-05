import { SowasitClient } from '../dist/esm/index.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '../.env.local' });

async function main() {
  const client = new SowasitClient({
    baseUrl: process.env.SOWASIT_API_URL || 'http://localhost:3001',
    apiKey: process.env.SOWASIT_API_KEY,
  });

  try {
    console.log('🔐 1. Creating a new blockchain chain...');
    const chainId = 'sensor-data-' + Date.now();
    const chain = await client.chains.create(chainId, 'Sensor Data Chain', {
      description: 'Storing IoT sensor readings',
      visibility: 'private',
      type: 'data',
    });
    console.log('✅ Chain created:', chain.id);

    console.log('\n📝 2. Adding sensor blocks to the chain...');
    const readings = [
      { sensor: 'temp-001', value: 22.5, unit: '°C' },
      { sensor: 'humidity-001', value: 65, unit: '%' },
      { sensor: 'pressure-001', value: 1013.25, unit: 'hPa' },
    ];

    for (const reading of readings) {
      const block = await client.blocks.create(chain.id, {
        timestamp: new Date().toISOString(),
        ...reading,
      });
      console.log(`  ✅ Block added: ${reading.sensor} = ${reading.value}${reading.unit}`);
    }

    console.log('\n🔎 3. Retrieving and verifying the chain...');
    const verifiedChain = await client.chains.get(chain.id);
    console.log('✅ Chain verified:', {
      name: verifiedChain.name,
      visibility: verifiedChain.visibility,
      created: verifiedChain.created_at,
    });

    console.log('\n📦 4. Getting all blocks from the chain...');
    const blocks = await client.blocks.list(chain.id);
    console.log(`✅ Retrieved ${blocks.length} blocks:`);
    blocks.forEach((block, index) => {
      console.log(`   Block ${index + 1}: ${block.data.sensor} = ${block.data.value}`);
    });

    console.log('\n💾 5. Exporting for backup...');
    const exported = await client.chains.export(chain.id);
    fs.writeFileSync(
      'chain-export.json',
      JSON.stringify(exported, null, 2)
    );
    console.log('✅ Chain exported to chain-export.json');
    console.log(`   Total blocks: ${exported.stats.total_blocks}`);
    console.log(`   Time span: ${exported.stats.first_block_created} to ${exported.stats.last_block_created}`);

    console.log('\n✨ Complete! Your blockchain is working.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
