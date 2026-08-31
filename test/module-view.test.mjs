import assert from 'node:assert/strict';
import test from 'node:test';

import { splitAddress, transformModuleGraph } from '../module-view.mjs';

test('keeps dots inside for_each module keys', () => {
  assert.deepEqual(
    splitAddress('module.service["us.east"].terraform_data.example'),
    ['module', 'service["us.east"]', 'terraform_data', 'example'],
  );
});

test('deduplicates separate instances of a for_each module call', () => {
  const addresses = [
    'module.service["blue"].terraform_data.example',
    'module.service["green"].terraform_data.example',
  ];
  const manifest = new Map([
    ['service', { identity: 'source:example/service@1.0.0', label: 'example/service@1.0.0' }],
  ]);

  const graph = transformModuleGraph(addresses, [], 'deduplicated', manifest);

  assert.deepEqual(graph.addresses, [
    'module.service["blue"]',
    'module.service["green"]',
  ]);
  assert.equal(graph.definitions.length, 1);
  assert.deepEqual(graph.definitions[0].addresses, ['terraform_data.example']);
});

test('rejects unknown module views', () => {
  assert.throws(
    () => transformModuleGraph([], [], 'collapsed'),
    /Unsupported module view: collapsed/,
  );
});

test('contracts hidden resources between the inputs and outputs of non-representative calls', () => {
  const addresses = [
    'module.blue.output.id',
    'module.blue.terraform_data.example',
    'module.blue.var.name',
    'module.green.output.id',
    'module.green.terraform_data.example',
    'module.green.var.name',
  ];
  const edges = [
    ['module.blue.output.id', 'module.blue.terraform_data.example'],
    ['module.blue.terraform_data.example', 'module.blue.var.name'],
    ['module.green.output.id', 'module.green.terraform_data.example'],
    ['module.green.terraform_data.example', 'module.green.var.name'],
  ];
  const manifest = new Map([
    ['blue', { identity: 'service', label: './service' }],
    ['green', { identity: 'service', label: './service' }],
  ]);

  const graph = transformModuleGraph(addresses, edges, 'representative', manifest);

  assert.deepEqual(graph.addresses, [
    'module.blue.output.id',
    'module.blue.terraform_data.example',
    'module.blue.var.name',
    'module.green.output.id',
    'module.green.var.name',
  ]);
  assert.deepEqual(graph.edges, [
    ['module.blue.output.id', 'module.blue.terraform_data.example'],
    ['module.blue.terraform_data.example', 'module.blue.var.name'],
    ['module.green.output.id', 'module.green.var.name'],
  ]);
  assert.deepEqual(graph.definitions, []);
});

test('links nested calls from their displayed parent definition', () => {
  const addresses = [
    'module.east.module.blue.terraform_data.example',
    'module.east.module.green.terraform_data.example',
    'module.west.module.blue.terraform_data.example',
    'module.west.module.green.terraform_data.example',
  ];
  const manifest = new Map([
    ['east', { identity: 'region', label: './region' }],
    ['west', { identity: 'region', label: './region' }],
    ['east.blue', { identity: 'service', label: './service' }],
    ['east.green', { identity: 'service', label: './service' }],
    ['west.blue', { identity: 'service', label: './service' }],
    ['west.green', { identity: 'service', label: './service' }],
  ]);

  const graph = transformModuleGraph(addresses, [], 'deduplicated', manifest);
  const region = graph.definitions.find(({ identity }) => identity == 'region');

  assert.deepEqual(graph.addresses, ['module.east', 'module.west']);
  assert.deepEqual(graph.references, [
    { address: 'module.east', identity: 'region' },
    { address: 'module.west', identity: 'region' },
  ]);
  assert.deepEqual(region.addresses, ['module.blue', 'module.green']);
  assert.deepEqual(region.references, [
    { address: 'module.blue', identity: 'service' },
    { address: 'module.green', identity: 'service' },
  ]);
});
