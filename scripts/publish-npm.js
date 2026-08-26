/**
 * 将 Vue2 ElementUI 包以 @xiaoql scope 发布到 npm。
 * 源码仍保留 @lljj 包名，便于后续合并上游；仅在发布时改名。
 *
 * 规则：本地 version 在 npm 上还不存在时才 publish。
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCOPE_FROM = '@lljj/';
const SCOPE_TO = '@xiaoql/';
const REPO_URL = 'https://github.com/Qiliang/vue-json-schema-form';

const PACKAGE_DIRS = [
    'packages/lib/vue2/vue2-form-element',
];

function run(cmd, options = {}) {
    return execSync(cmd, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        ...options,
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

function publishPackage(dir) {
    const pkgPath = path.join(ROOT, dir, 'package.json');
    const original = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(original);

    if (pkg.private === true) {
        console.log(`skip ${dir} (private)`);
        return 'skipped';
    }

    if (!pkg.name || !pkg.name.startsWith(SCOPE_FROM)) {
        console.log(`skip ${dir} (unexpected name: ${pkg.name})`);
        return 'skipped';
    }

    const publishName = pkg.name.replace(SCOPE_FROM, SCOPE_TO);
    const version = pkg.version;
    const published = getPublishedVersion(publishName);

    if (published === version) {
        console.log(`skip ${publishName}@${version} (already on npm)`);
        return 'skipped';
    }

    pkg.name = publishName;
    pkg.repository = REPO_URL;
    pkg.homepage = REPO_URL;
    pkg.publishConfig = {
        ...(pkg.publishConfig || {}),
        access: 'public',
        registry: 'https://registry.npmjs.org/',
    };

    fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 4)}\n`);

    try {
        console.log(`publishing ${publishName}@${version} ...`);
        execSync('npm publish --access public', {
            cwd: path.join(ROOT, dir),
            stdio: 'inherit',
            env: process.env,
        });
        console.log(`published ${publishName}@${version}`);
        return 'published';
    } finally {
        fs.writeFileSync(pkgPath, original);
    }
}

function main() {
    const results = { published: [], skipped: [], failed: [] };

    for (const dir of PACKAGE_DIRS) {
        try {
            const status = publishPackage(dir);
            if (status === 'published') {
                results.published.push(dir);
            } else {
                results.skipped.push(dir);
            }
        } catch (err) {
            results.failed.push(dir);
            console.error(`failed ${dir}:`, err.message || err);
            if (err.stdout) console.error(err.stdout);
            if (err.stderr) console.error(err.stderr);
        }
    }

    console.log('\n--- publish summary ---');
    console.log(`published: ${results.published.length}`);
    console.log(`skipped:   ${results.skipped.length}`);
    console.log(`failed:    ${results.failed.length}`);

    if (results.failed.length) {
        process.exit(1);
    }

    if (!results.published.length) {
        console.log('没有需要发布的新版本。请修改 packages/lib/vue2/vue2-form-element/package.json 中的 version 后再推送。');
    }
}

main();
