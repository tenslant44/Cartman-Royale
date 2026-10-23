/*
 * Builds a portable page export.
 *
 * The page keeps its code in portable.html and resolves local media relative
 * to that page. It does not depend on the generated portable-parts directory.
 */

const fs = require('fs');
const path = require('path');

const root = __dirname;
const outputPath = path.join(root, 'portable.html');

const mediaTypes = {
  '.fbx': 'application/octet-stream',
  '.flac': 'audio/flac',
  '.gif': 'image/gif',
  '.glb': 'model/gltf-binary',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.ogg': 'audio/ogg',
  '.png': 'image/png',
  '.wav': 'audio/wav'
};

function collectMediaFiles(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'portable-parts') {
      continue;
    }

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectMediaFiles(absolutePath, files);
      continue;
    }

    if (mediaTypes[path.extname(entry.name).toLowerCase()]) {
      files.push(absolutePath);
    }
  }
  return files.sort();
}

function assetKey(absolutePath) {
  return path.relative(root, absolutePath).split(path.sep).join('/');
}

function inlineAudioSources(html) {
  return html.replace(
    /\b(src)=(")(\/[^"]+)(\2)/g,
    (_match, _attribute, quote, source) =>
      `data-portable-src=${quote}${source}${quote}`
  );
}

function rewriteLocalAssetUrls(source, mediaKeys) {
  let rewritten = source;
  for (const key of mediaKeys) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const quotedPath = new RegExp(`(["'\`])/${escapedKey}\\1`, 'g');
    rewritten = rewritten.replace(quotedPath, '$1./' + key + '$1');
  }
  return rewritten;
}

function createPortablePage() {
  const sourceHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const countdownSource = fs.readFileSync(path.join(root, 'countdown.js'), 'utf8');
  const mediaKeys = collectMediaFiles(root).map(assetKey);
  const gameSource = rewriteLocalAssetUrls(
    fs.readFileSync(path.join(root, 'game.js'), 'utf8'),
    mediaKeys
  );

  const html = inlineAudioSources(sourceHtml)
    .replace('  <script type="module" src="countdown.js"></script>\n', '')
    .replace('  <script type="module" src="game.js"></script>\n', '');

  const portableRuntime = `
  <!-- PORTABLE EXPORT: local media is resolved beside this HTML file. -->
  <script>
    // Mark the embedded game as standalone before its module code loads.
    window.__PORTABLE_BUILD__ = true;

    function portableAssetUrl(value) {
      if (
        typeof value !== 'string' ||
        value.startsWith('data:') ||
        value.startsWith('blob:') ||
        value.startsWith('./') ||
        value.startsWith('../') ||
        value.startsWith('//') ||
        /^https?:\\/\\//.test(value)
      ) {
        return value;
      }
      return value.startsWith('/') ? \`.\${value}\` : value;
    }

    // Redirect absolute local media URLs to paths relative to portable.html.
    for (const [prototype, property] of [
      [window.HTMLImageElement?.prototype, 'src'],
      [window.HTMLMediaElement?.prototype, 'src'],
      [window.HTMLSourceElement?.prototype, 'src']
    ]) {
      if (!prototype) continue;
      const descriptor = Object.getOwnPropertyDescriptor(prototype, property);
      if (!descriptor?.set) continue;
      Object.defineProperty(prototype, property, {
        configurable: descriptor.configurable,
        enumerable: descriptor.enumerable,
        get: descriptor.get,
        set(value) {
          descriptor.set.call(this, portableAssetUrl(value));
        }
      });
    }

    for (const element of document.querySelectorAll('[data-portable-src]')) {
      element.src = portableAssetUrl(element.getAttribute('data-portable-src'));
    }

    if (typeof window.fetch === 'function') {
      const nativeFetch = window.fetch.bind(window);
      window.fetch = (input, init) => {
        if (input instanceof Request) {
          return nativeFetch(new Request(portableAssetUrl(input.url), input), init);
        }
        return nativeFetch(portableAssetUrl(input), init);
      };
    }

  </script>
  <script type="module">
${countdownSource}
  </script>
  <script type="module">
${gameSource}
  </script>
`;

  return `${html.replace('</body>', `${portableRuntime}</body>`)}
<!--
  Cartman Royale portable export.
  Keep portable.html beside the project's existing media files.
-->
`;
}

fs.writeFileSync(outputPath, createPortablePage());

const outputSize = fs.statSync(outputPath).size;

console.log('Wrote portable.html without portable-parts dependencies.');
console.log(`portable.html size: ${outputSize} bytes.`);
