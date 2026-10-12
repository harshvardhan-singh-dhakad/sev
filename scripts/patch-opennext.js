const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'node_modules', '@opennextjs', 'aws', 'dist', 'build', 'copyTracedFiles.js');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
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
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('[patch-opennext] Successfully patched copyTracedFiles.js for Windows support.');
  } else {
    console.log('[patch-opennext] copyTracedFiles.js is already patched or target pattern not found.');
  }
} else {
  console.log('[patch-opennext] @opennextjs/aws not found, skipping patch.');
}
