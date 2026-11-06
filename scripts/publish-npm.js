/**
 * 发布根目录的 @xiaoql/vue2-form-element。
 * 本地 version 在 npm 上还不存在时才 publish。
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

function run(cmd) {
    return execSync(cmd, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
    });
}

function getPublishedVersion(name) {
    try {
        return run(`npm view ${name} version --registry https://registry.npmjs.org`).trim();
    } catch (err) {
        const output = `${err.stdout || ''}${err.stderr || ''}`;
        if (err.status === 1 || /E404|404/.test(output)) {
            return null;
        }
        throw err;
    }
}

function main() {
    const { name, version } = pkg;
    const published = getPublishedVersion(name);

    if (published === version) {
        console.log(`skip ${name}@${version} (already on npm)`);
        return;
    }

    console.log(`publishing ${name}@${version} ...`);
    execSync('npm publish --access public', {
        cwd: ROOT,
        stdio: 'inherit',
        env: process.env,
    });
    console.log(`published ${name}@${version}`);
}

main();
