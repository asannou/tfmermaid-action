#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';

const expectedLabels = [
  'module-views/expanded',
  'module-views/compact',
  'module-views/representative',
  'module-views/deduplicated',
  'terraform-provider-aws/examples/two-tier',
  'terraform-provider-aws/examples/ecs-alb',
  'terraform-provider-aws/examples/events/kinesis',
  'terraform-provider-aws/examples/lambda-file-systems',
  'terraform-provider-aws/examples/networking',
  'terraform-provider-aws/examples/rds',
  'terraform-provider-aws/examples/s3-api-gateway-integration',
  'terraform-provider-aws/examples/s3-cross-account-access',
  'terraform-provider-aws/examples/sagemaker',
  'terraform-provider-aws/examples/transit-gateway-cross-account-peering-attachment',
  'terraform-provider-aws/examples/workspaces',
  'terraform-provider-google/examples/cloud-armor',
  'terraform-provider-google/examples/content-based-load-balancing',
  'terraform-provider-google/examples/endpoints-on-compute-engine',
  'terraform-provider-azurerm/examples/api-management',
  'terraform-provider-azurerm/examples/recovery-services/virtual-machine',
  'terraform-provider-azurerm/examples/traffic-manager/vm-scale-set',
];

const fileName = process.argv[2] ?? 'README.md';
const markdown = fs.readFileSync(fileName, 'utf8');
const blocks = new Map();
const blockPattern = /```mermaid\n%%tfmermaid:([^\n]+)\n([\s\S]*?)\n```/g;

for (const match of markdown.matchAll(blockPattern)) {
  blocks.set(match[1], match[2]);
}

assert.equal(blocks.size, expectedLabels.length, 'unexpected diagram count');

for (const label of expectedLabels) {
  const diagram = blocks.get(label);
  assert.ok(diagram, `missing diagram: ${label}`);

  const lines = diagram.split('\n');
  const nodeCount = lines.filter((line) => /^n[0-9a-z]+(?:\[|\(|\{)/.test(line)).length;
  const edgeCount = lines.filter((line) => /^n[0-9a-z]+-+>n[0-9a-z]+$/.test(line)).length;

  assert.ok(nodeCount > 0, `empty diagram: ${label}`);
  console.log(`${label}: ${nodeCount} nodes, ${edgeCount} edges`);
}

const occurrences = (label, pattern) =>
  (blocks.get(label).match(pattern) ?? []).length;
assert.equal(
  occurrences('module-views/expanded', /\["terraform_data\.service"\]:::r/g),
  2,
  'expanded view must render both module bodies',
);
assert.equal(
  occurrences('module-views/compact', /terraform_data\.service/g),
  0,
  'compact view must hide module bodies',
);
assert.equal(
  occurrences('module-views/representative', /\[\"terraform_data\.service\"\]:::r/g),
  1,
  'representative view must render one module body',
);
assert.equal(
  occurrences('module-views/representative', /\(\[\"output\.id\"\]\):::v/g),
  2,
  'representative view must retain every module output',
);
assert.equal(
  occurrences('module-views/representative', /\(\[\"var\.name\"\]\):::v/g),
  2,
  'representative view must retain every module input',
);
assert.doesNotMatch(
  blocks.get('module-views/representative'),
  /Module definitions/,
  'representative view must keep the representative in place',
);
assert.match(
  blocks.get('module-views/representative'),
  /Module source: \.\/service/,
  'representative view must group calls sharing a module source',
);
assert.match(
  blocks.get('module-views/representative'),
  /subgraph \"n\w+_padding\"\[\" \"\][\s\S]*class n\w+_padding ps/,
  'representative module source group must include padding',
);
assert.equal(
  occurrences('module-views/representative', /-\.->/g),
  0,
  'representative source groups must not add dependency arrows',
);
assert.equal(
  occurrences('module-views/deduplicated', /\["terraform_data\.service"\]:::r/g),
  1,
  'deduplicated view must render a repeated source once',
);
assert.match(
  blocks.get('module-views/deduplicated'),
  /Module definitions/,
  'deduplicated view must include module definitions',
);

const trafficManager =
  'terraform-provider-azurerm/examples/traffic-manager/vm-scale-set';
assert.match(
  blocks.get(trafficManager),
  /Module source: \.\/modules\/region/,
  'traffic manager example must group repeated region modules by source',
);
assert.equal(
  occurrences(trafficManager, /\[\"azurerm_lb\.example\"\]:::r/g),
  1,
  'traffic manager example must fully render one region module',
);
assert.match(
  blocks.get(trafficManager),
  /\[\"module\.region1\"\]/,
  'traffic manager example must include its representative module',
);
assert.match(
  blocks.get(trafficManager),
  /\[\"module\.region2\"\]/,
  'traffic manager example must include its abbreviated module',
);
assert.doesNotMatch(
  blocks.get(trafficManager),
  /Module definitions/,
  'representative traffic manager example must not use module definitions',
);
