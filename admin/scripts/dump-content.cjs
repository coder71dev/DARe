// One-time migration helper (Phase 1).
//
// site/assets/js/content.js is a browser global (`const TPRAF_CONTENT = {...}`),
// not a JSON or CommonJS file, so it can't be `require()`d directly. This loads
// it in a sandboxed VM context, pulls out the two consts it declares, and writes
// them as plain JSON for `php artisan tpraf:import-content` to read.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const contentJsPath = path.resolve(__dirname, '../../site/assets/js/content.js');
const outPath = path.resolve(__dirname, '../storage/app/import/tpraf-content.json');

const source = fs.readFileSync(contentJsPath, 'utf8');

// `const`/`let` top-level bindings don't become properties of the VM context
// object the way `var` does, so pull the values out via the script's own
// completion value instead of reading them off the sandbox afterwards.
const script = new vm.Script(`${source}\n;({TPRAF_CONTENT, TPRAF_DSP_IMP});`, { filename: 'content.js' });
const context = vm.createContext({});
const result = script.runInContext(context);

if (!result.TPRAF_CONTENT || !result.TPRAF_DSP_IMP) {
    throw new Error(
        'content.js did not define both TPRAF_CONTENT and TPRAF_DSP_IMP — check the source file hasn\'t changed shape.'
    );
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(
    outPath,
    JSON.stringify({ content: result.TPRAF_CONTENT, dspImp: result.TPRAF_DSP_IMP }, null, 2)
);

console.log(`Wrote ${outPath}`);
console.log(`Views: ${Object.keys(result.TPRAF_CONTENT).join(', ')}`);
