import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

function convert(dot, environment = {}) {
  const result = spawnSync(process.execPath, ['index.mjs'], {
    cwd: new URL('..', import.meta.url),
    input: dot,
    encoding: 'utf8',
    env: {
      ...process.env,
      EXCLUDE: '',
      INCLUDE: '',
      MODULE_VIEW: 'expanded',
      ...environment,
    },
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

test('converts Terraform 1.7 and later graph output', () => {
  const output = convert(`digraph G {
    "aws_vpc.main" [label="aws_vpc.main"];
    "module.network.aws_subnet.main" [label="module.network.aws_subnet.main"];
    "module.network.aws_subnet.main" -> "aws_vpc.main";
  }`);

  assert.match(output, /\["aws_vpc\.main"\]:::r/);
  assert.match(output, /\["aws_subnet\.main"\]:::r/);
  assert.match(output, /subgraph .*\["module\.network"\]/);
  assert.match(output, /n\w+-->n\w+/);
});

test('continues to convert Terraform 1.6 and earlier graph output', () => {
  const output = convert(`digraph {
    "[root] aws_instance.web (expand)" [label = "aws_instance.web", shape = "box"];
    "[root] var.name (expand)" [label = "var.name", shape = "note"];
    "[root] aws_instance.web (expand)" -> "[root] var.name (expand)";
  }`);

  assert.match(output, /\["aws_instance\.web"\]:::r/);
  assert.match(output, /\(\["var\.name"\]\):::v/);
  assert.match(output, /n\w+--->n\w+/);
});

test('uses Mermaid entity codes for quotes in provider labels', () => {
  const output = convert(`digraph {
    "[root] provider[\\"terraform.io/builtin/terraform\\"]" [shape = "diamond"];
  }`, { INCLUDE: 'provider' });

  assert.match(output, /provider<br\/>\[#quot;terraform\.io\/builtin\/terraform#quot;\]/);
  assert.doesNotMatch(output, /&quot;/);
});

const repeatedModuleGraph = `digraph G {
  "terraform_data.gateway" -> "module.blue.output.id";
  "module.blue.output.id" -> "module.blue.terraform_data.service";
  "module.blue.terraform_data.service" -> "module.blue.var.name";
  "terraform_data.gateway" -> "module.green.output.id";
  "module.green.output.id" -> "module.green.terraform_data.service";
  "module.green.terraform_data.service" -> "module.green.var.name";
}`;

test('keeps every module instance expanded by default', () => {
  const output = convert(repeatedModuleGraph);

  assert.equal((output.match(/\["module\.(?:blue|green)"\]/g) ?? []).length, 2);
  assert.equal((output.match(/\["terraform_data\.service"\]:::r/g) ?? []).length, 2);
  assert.doesNotMatch(output, /Module definitions/);
});

test('collapses module internals in compact view', () => {
  const output = convert(repeatedModuleGraph, { MODULE_VIEW: 'compact' });

  assert.match(output, /\["module\.blue"\]:::v/);
  assert.match(output, /\["module\.green"\]:::v/);
  assert.doesNotMatch(output, /terraform_data\.service/);
  assert.doesNotMatch(output, /Module definitions/);
});

test('renders the definition of a repeated module source once', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'tfmermaid-modules-'));
  const manifest = path.join(directory, 'modules.json');
  fs.writeFileSync(manifest, JSON.stringify({
    Modules: [
      { Key: '', Source: '', Dir: '.' },
      { Key: 'blue', Source: './service', Dir: './service' },
      { Key: 'green', Source: './service', Dir: './service' },
    ],
  }));

  const output = convert(repeatedModuleGraph, {
    MODULE_VIEW: 'deduplicated',
    TF_MODULES_FILE: manifest,
  });

  assert.match(output, /\["module\.blue"\]:::v/);
  assert.match(output, /\["module\.green"\]:::v/);
  assert.match(output, /Module definitions/);
  assert.match(output, /\["\.\/service"\]/);
  assert.equal((output.match(/direction LR/g) ?? []).length, 2);
  assert.match(output, /class \w+ ms\n/);
  assert.match(output, /style \w+ fill:none,stroke:#dce0e6,stroke-width:2px/);
  assert.equal((output.match(/\["terraform_data\.service"\]:::r/g) ?? []).length, 1);
  assert.equal((output.match(/-\.->/g) ?? []).length, 2);
  const blue = output.match(/(n\w+)\["module\.blue"\]/)[1];
  const green = output.match(/(n\w+)\["module\.green"\]/)[1];
  const definition = output.match(/subgraph "(n\w+)"\["\.\/service"\]/)[1];
  assert.ok(output.includes(`${blue}-.->${definition}`));
  assert.ok(output.includes(`${green}-.->${definition}`));

  const reversed = convert(repeatedModuleGraph, {
    MODULE_VIEW: 'deduplicated',
    TF_MODULES_FILE: manifest,
    ARROW_DIRECTION: 'reverse',
  });
  const reversedBlue = reversed.match(/(n\w+)\["module\.blue"\]/)[1];
  const reversedGreen = reversed.match(/(n\w+)\["module\.green"\]/)[1];
  const reversedDefinition = reversed.match(
    /subgraph "(n\w+)"\["\.\/service"\]/,
  )[1];
  assert.ok(reversed.includes(`${reversedDefinition}-.->${reversedBlue}`));
  assert.ok(reversed.includes(`${reversedDefinition}-.->${reversedGreen}`));
});

test('fully renders one representative and keeps only inputs and outputs in the rest', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'tfmermaid-modules-'));
  const manifest = path.join(directory, 'modules.json');
  fs.writeFileSync(manifest, JSON.stringify({
    Modules: [
      { Key: '', Source: '', Dir: '.' },
      { Key: 'blue', Source: './service', Dir: './service' },
      { Key: 'green', Source: './service', Dir: './service' },
    ],
  }));

  const output = convert(repeatedModuleGraph, {
    MODULE_VIEW: 'representative',
    TF_MODULES_FILE: manifest,
  });

  assert.match(output, /subgraph \"\w+\"\[\"module\.blue\"\]/);
  assert.match(output, /subgraph \"\w+\"\[\"module\.green\"\]/);
  assert.equal((output.match(/\[\"terraform_data\.service\"\]:::r/g) ?? []).length, 1);
  assert.equal((output.match(/\(\[\"output\.id\"\]\):::v/g) ?? []).length, 2);
  assert.equal((output.match(/\(\[\"var\.name\"\]\):::v/g) ?? []).length, 2);
  assert.doesNotMatch(output, /Module definitions/);
  assert.match(output, /subgraph \"\w+\"\[\"Module source: \.\/service\"\]/);
  assert.doesNotMatch(output, /-\.->/);
  const source = output.match(
    /subgraph \"(n\w+)\"\[\"Module source: \.\/service\"\]/,
  )[1];
  assert.ok(output.includes(`subgraph \"${source}_padding\"[\" \"]`));
  assert.ok(output.includes(`class ${source}_padding ps`));
  assert.ok(output.includes(
    `style ${source} fill:none,stroke:#dce0e6,stroke-width:2px`,
  ));
});
