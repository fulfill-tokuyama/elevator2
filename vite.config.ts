import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import type {Plugin} from 'vite';

/**
 * Safari 12 (iOS 12) does not support CSS @layer or @property.
 * Tailwind v4 wraps all output in @layer blocks, making styles invisible.
 * This plugin unwraps @layer blocks post-build so the inner rules apply normally.
 */
function unwrapCSSLayers(): Plugin {
  return {
    name: 'unwrap-css-layers',
    enforce: 'post',
    generateBundle(_, bundle) {
      for (const [key, chunk] of Object.entries(bundle)) {
        if (key.endsWith('.css') && chunk.type === 'asset') {
          let css = typeof chunk.source === 'string' ? chunk.source : new TextDecoder().decode(chunk.source);
          css = stripAtBlocks(css, '@layer');
          css = stripAtBlocks(css, '@property');
          chunk.source = css;
        }
      }
    },
  };
}

function stripAtBlocks(css: string, atRule: string): string {
  let result = '';
  let i = 0;
  while (i < css.length) {
    if (css.startsWith(atRule + ' ', i) || css.startsWith(atRule + '\t', i)) {
      let j = i + atRule.length;
      while (j < css.length && css[j] !== '{' && css[j] !== ';') j++;
      if (j >= css.length) break;
      if (css[j] === ';') {
        i = j + 1;
        continue;
      }
      // css[j] === '{' — unwrap for @layer, remove for @property
      let depth = 1;
      let k = j + 1;
      while (k < css.length && depth > 0) {
        if (css[k] === '{') depth++;
        else if (css[k] === '}') depth--;
        k++;
      }
      if (atRule === '@layer') {
        result += css.substring(j + 1, k - 1);
      }
      i = k;
    } else {
      result += css[i];
      i++;
    }
  }
  return result;
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      legacy({
        targets: ['ios >= 12', 'safari >= 12'],
      }),
      unwrapCSSLayers(),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      cssMinify: 'lightningcss',
    },
    css: {
      lightningcss: {
        targets: {
          safari: (12 << 16),
          ios_saf: (12 << 16),
        },
      },
    },
  };
});
