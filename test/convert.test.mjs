import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

test('requests a detailed plan graph from Terraform', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'tfmermaid-'));
  const binDirectory = path.join(directory, 'bin');
  const readme = path.join(directory, 'README.md');
  const terraform = path.join(binDirectory, 'terraform');

  fs.mkdirSync(binDirectory);
  fs.writeFileSync(readme, '```mermaid\n%%tfmermaid\n```\n');
  fs.writeFileSync(terraform, `#!/bin/sh
if [ "$1" = init ] && [ "$2" = -backend=false ]; then
  exit 0
fi
if [ "$1" = graph ] && [ "$2" = -type=plan ]; then
  printf '%s\\n' '"[root] output.result (expand)" -> "[root] aws_instance.web (expand)"'
  exit 0
fi
exit 1
`, { mode: 0o755 });

  const result = spawnSync(
    path.resolve('convert.sh'),
    [readme, ''],
    {
      cwd: directory,
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${binDirectory}:${process.env.PATH}`,
        INCLUDE: '',
        EXCLUDE: '',
      },
    },
  );

  assert.equal(result.status, 0, result.stderr);
  const output = fs.readFileSync(readme, 'utf8');
  assert.match(output, /\["aws_instance\.web"\]:::r/);
  assert.match(output, /\(\["output\.result"\]\):::v/);
});
