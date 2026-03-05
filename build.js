const esbuild = require('esbuild');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');

const commonOptions = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  sourcemap: true,
  platform: 'neutral',
  target: 'ES2020',
  external: [],
};

const builds = [
  {
    ...commonOptions,
    outfile: 'dist/cjs/index.js',
    format: 'cjs',
    platform: 'node',
  },
  {
    ...commonOptions,
    outfile: 'dist/esm/index.js',
    format: 'esm',
    platform: 'node',
  },
  {
    ...commonOptions,
    outfile: 'dist/umd/sowasit.umd.js',
    format: 'iife',
    globalName: 'SoWasIt',
    platform: 'browser',
  },
];

async function build() {
  try {
    if (isWatch) {
      console.log('🔄 Watching for changes...\n');

      const contexts = await Promise.all(
        builds.map((config) => esbuild.context(config))
      );

      await Promise.all(contexts.map((ctx) => ctx.watch()));

      console.log('✅ Builds set up for watching\n');
    } else {
      console.log('🏗️  Building SoWasIt Client...\n');

      for (const config of builds) {
        await esbuild.build(config);
        console.log(`✅ Built: ${config.outfile}`);
      }

      generateDeclarations();
      console.log('\n✨ Build complete!');
    }
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

function generateDeclarations() {
  try {
    console.log('📝 Generating TypeScript declarations...');
    execSync('npx tsc --emitDeclarationOnly --outDir dist/types', {
      stdio: 'pipe',
    });

    if (fs.existsSync('dist/types/index.d.ts')) {
      fs.copyFileSync('dist/types/index.d.ts', 'dist/index.d.ts');
      fs.copyFileSync('dist/types/types.d.ts', 'dist/types.d.ts');
      console.log('✅ Type declarations generated');
    }
  } catch (error) {
    console.warn('⚠️  Type declaration generation failed (optional)');
  }
}

build();
