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
if [ "$1" = init ] && [ "$2" = -reconfigure ]; then
  test -n "$TF_DATA_DIR" || exit 2
  test "$3" = "-backend-config=path=$TF_DATA_DIR/terraform.tfstate" || exit 3
  grep -q 'backend "local"' ./*_override.tf || exit 4
  printf '%s' "$TF_DATA_DIR" > tf-data-dir
  exit 0
fi
if [ "$1" = graph ] && [ "$2" = -type=plan ]; then
  test "$TF_DATA_DIR" = "$(cat tf-data-dir)" || exit 5
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
  assert.equal(fs.existsSync(fs.readFileSync(path.join(directory, 'tf-data-dir'), 'utf8')), false);
  assert.deepEqual(fs.readdirSync(directory).filter((file) => file.endsWith('_override.tf')), []);
});

test('preserves the target file when Terraform graph fails', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'tfmermaid-'));
  const binDirectory = path.join(directory, 'bin');
  const readme = path.join(directory, 'README.md');
  const terraform = path.join(binDirectory, 'terraform');
  const original = '```mermaid\n%%tfmermaid\n```\n';

  fs.mkdirSync(binDirectory);
  fs.writeFileSync(readme, original);
  fs.writeFileSync(terraform, `#!/bin/sh
if [ "$1" = init ]; then exit 0; fi
if [ "$1" = graph ]; then exit 23; fi
exit 1
`, { mode: 0o755 });

  const result = spawnSync(path.resolve('convert.sh'), [readme, ''], {
    cwd: directory,
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${binDirectory}:${process.env.PATH}`,
      INCLUDE: '',
      EXCLUDE: '',
    },
  });

  assert.notEqual(result.status, 0);
  assert.equal(fs.readFileSync(readme, 'utf8'), original);
  assert.deepEqual(fs.readdirSync(directory).filter((file) => file.endsWith('_override.tf')), []);
});

test('generates a graph without connecting to the configured S3 backend', (context) => {
  if (spawnSync('terraform', ['version']).status !== 0) {
    context.skip('Terraform is not installed');
    return;
  }

  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'tfmermaid-'));
  const readme = path.join(directory, 'README.md');
  fs.writeFileSync(readme, '```mermaid\n%%tfmermaid\n```\n');
  fs.writeFileSync(path.join(directory, 'main.tf'), `terraform {
  backend "s3" {
    bucket       = "tfmermaid-issue-5"
    key          = "terraform.tfstate"
    region       = "ap-northeast-1"
    use_lockfile = true
  }
}

resource "terraform_data" "example" {
  input = "issue-5"
}
`);

  const result = spawnSync(path.resolve('convert.sh'), [readme, ''], {
    cwd: directory,
    encoding: 'utf8',
    env: {
      ...process.env,
      INCLUDE: '',
      EXCLUDE: '',
    },
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(fs.readFileSync(readme, 'utf8'), /\["terraform_data\.example"\]:::r/);
});

test('passes initialized module metadata to the deduplicated view', (context) => {
  if (spawnSync('terraform', ['version']).status !== 0) {
    context.skip('Terraform is not installed');
    return;
  }

  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'tfmermaid-'));
  const readme = path.join(directory, 'README.md');
  fs.writeFileSync(readme, '```mermaid\n%%tfmermaid\n```\n');

  const result = spawnSync(path.resolve('convert.sh'), [readme, ''], {
    cwd: path.resolve('examples/module-views'),
    encoding: 'utf8',
    env: {
      ...process.env,
      INCLUDE: '',
      EXCLUDE: '',
      MODULE_VIEW: 'deduplicated',
    },
  });

  assert.equal(result.status, 0, result.stderr);
  const output = fs.readFileSync(readme, 'utf8');
  assert.match(output, /Module definitions/);
  assert.equal((output.match(/\["terraform_data\.service"\]:::r/g) ?? []).length, 1);
  assert.equal((output.match(/-\.->/g) ?? []).length, 2);
});

test('passes initialized module metadata to the representative view', (context) => {
  if (spawnSync('terraform', ['version']).status !== 0) {
    context.skip('Terraform is not installed');
    return;
  }

  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'tfmermaid-'));
  const readme = path.join(directory, 'README.md');
  fs.writeFileSync(readme, '```mermaid\n%%tfmermaid\n```\n');

  const result = spawnSync(path.resolve('convert.sh'), [readme, ''], {
    cwd: path.resolve('examples/module-views'),
    encoding: 'utf8',
    env: {
      ...process.env,
      INCLUDE: '',
      EXCLUDE: '',
      MODULE_VIEW: 'representative',
    },
  });

  assert.equal(result.status, 0, result.stderr);
  const output = fs.readFileSync(readme, 'utf8');
  assert.equal((output.match(/\[\"terraform_data\.service\"\]:::r/g) ?? []).length, 1);
  assert.equal((output.match(/\(\[\"output\.id\"\]\):::v/g) ?? []).length, 2);
  assert.equal((output.match(/\(\[\"var\.name\"\]\):::v/g) ?? []).length, 2);
  assert.doesNotMatch(output, /Module definitions/);
});
