const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const testsDir = path.join(root, "tests");
const testFiles = fs
  .readdirSync(testsDir)
  .filter((filename) => filename.endsWith(".test.js"))
  .sort();

const commands = [
  ["app syntax", ["--check", path.join(root, "app.js")]],
  ...testFiles.map((filename) => [filename, [path.join(testsDir, filename)]])
];

let failed = false;

for (const [label, args] of commands) {
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: "utf8"
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.status !== 0) {
    console.error(`Failed: ${label}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log(`Source test runner passed ${commands.length} checks.`);
