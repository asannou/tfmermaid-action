import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

function convert(dot) {
  const result = spawnSync(process.execPath, ['index.mjs'], {
    cwd: new URL('..', import.meta.url),
    input: dot,
    encoding: 'utf8',
    env: {
      ...process.env,
      EXCLUDE: '',
      INCLUDE: '',
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
