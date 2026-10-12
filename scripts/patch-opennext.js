const fs = require('fs');
const path = require('path');

// 1. Patch Windows symlink in @opennextjs/aws
const copyTracedFilesPath = path.join(__dirname, '..', 'node_modules', '@opennextjs', 'aws', 'dist', 'build', 'copyTracedFiles.js');
if (fs.existsSync(copyTracedFilesPath)) {
  let content = fs.readFileSync(copyTracedFilesPath, 'utf8');
  const targetCode = `        if (symlink) {
            try {
                symlinkSync(symlink, to);
            }
            catch (e) {
                if (e.code !== "EEXIST") {
                    throw e;
                }
            }
        }`;

  const replacementCode = `        if (symlink) {
            try {
                if (process.platform === "win32") {
                    const resolvedTarget = path.resolve(path.dirname(from), symlink);
                    if (existsSync(resolvedTarget) && statSync(resolvedTarget).isDirectory()) {
                        symlinkSync(resolvedTarget, to, "junction");
                    } else if (existsSync(resolvedTarget)) {
                        copyFileSync(resolvedTarget, to);
                    } else {
                        symlinkSync(symlink, to);
                    }
                } else {
                    symlinkSync(symlink, to);
                }
            }
            catch (e) {
                if (e.code !== "EEXIST") {
                    throw e;
                }
            }
        }`;

  if (content.includes(targetCode)) {
    content = content.replace(targetCode, replacementCode);
    fs.writeFileSync(copyTracedFilesPath, content, 'utf8');
    console.log('[patch-opennext] Successfully patched copyTracedFiles.js for Windows support.');
  } else {
    console.log('[patch-opennext] copyTracedFiles.js is already patched.');
  }
}

// 2. Patch load-manifest in @opennextjs/cloudflare for preview-props.json & safe fallback
const loadManifestPath = path.join(__dirname, '..', 'node_modules', '@opennextjs', 'cloudflare', 'dist', 'cli', 'build', 'patches', 'plugins', 'load-manifest.js');
if (fs.existsSync(loadManifestPath)) {
  let content = fs.readFileSync(loadManifestPath, 'utf8');
  if (content.includes('**/{*-manifest,required-server-files,prefetch-hints}.json')) {
    content = content.replace(
      '**/{*-manifest,required-server-files,prefetch-hints}.json',
      '**/{*-manifest,required-server-files,prefetch-hints,preview-props}.json'
    );
  }
  if (!content.includes('p.endsWith("preview-props")')) {
    content = content.replace(
      'p.endsWith("fallback-build-manifest") ||',
      'p.endsWith("fallback-build-manifest") ||\n        p.endsWith("preview-props") ||'
    );
  }
  // Prevent fatal worker exception on unexpected manifest calls
  const throwCall = 'throw new Error(`Unexpected loadManifest(${$PATH}) call!`);';
  const safeFallback = 'console.warn(`[OpenNext] Missing manifest: ${$PATH}, fallback to empty object`); return {};';
  if (content.includes(throwCall)) {
    content = content.replace(throwCall, safeFallback);
  }
  fs.writeFileSync(loadManifestPath, content, 'utf8');
  console.log('[patch-opennext] Successfully patched load-manifest.js for safe manifest handling.');
}
