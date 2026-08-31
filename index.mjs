#!/usr/bin/env node

import { argv, env, stdin, stdout } from 'process';
import { PassThrough } from 'stream';
import fs from 'fs';
import readline from 'readline/promises';
import {
  loadModuleManifest,
  splitAddress,
  transformModuleGraph,
} from './module-view.mjs';

const {
  ORIENTATION,
  ARROW_DIRECTION,
  ARROW_LENGTH,
  EXCLUDE,
  INCLUDE,
  MODULE_VIEW,
  TF_MODULES_FILE,
} = env;

class TerraformRegistry {

  constructor() {
    this.DOMAIN = 'registry.terraform.io';
    this.URL_BASE = `https://${this.DOMAIN}`;
    this.providers = {};
    this.categories = {
      var: 'Input Variables',
      output: 'Output Values',
    };
  }

  canonicalizeType(type) {
    return type.
      replace(/^aws_alb$/, 'aws_lb').
      replace(/^aws_alb_/, 'aws_lb_');
  }

  getCategory(name) {
    const type = name.split('.').slice(0, -1).join('.');
    return this.categories[this.canonicalizeType(type)];
  }

  async getCategories(provider) {
    const [domain, namespace, name] = provider.split('/');
    if (domain != this.DOMAIN) return;
    if (this.providers[name]) return;
    this.providers[name] = {};
    await this.httpsGetCategories(namespace, name);
  }

  createURL(pathname, searchParams) {
    const url = new URL(this.URL_BASE);
    url.pathname = pathname;
    url.search = new URLSearchParams(searchParams);
    return url;
  }

  async fetch(pathname, searchParams) {
    const response = await fetch(this.createURL(pathname, searchParams));
    return response.json();
  }

  async httpsGetCategories(namespace, name) {
    const provider = await this.fetch(
      '/v2/providers', {
        'filter[namespace]': namespace,
        'filter[name]': name,
      }
    );
    const versions = await this.fetch(
      provider.data[0].links.self, {
        include: 'provider-versions',
      }
    );
    const latest = versions.data.relationships['provider-versions'].data.pop();
    const docs = await this.fetch(
      `/v2/provider-versions/${latest.id}`, {
        include: 'provider-docs',
      }
    );
    for (const doc of docs.included) {
      const { attributes: { category, title, subcategory } } = doc;
      let prefix = '';
      switch (category) {
        case 'data-sources':
          prefix = 'data.';
        case 'resources':
          this.providers[name][`${prefix}${title}`] = doc;
          const titles = title.split('_');
          if (titles[0] != name) titles.unshift(name);
          this.categories[`${prefix}${titles.join('_')}`] = subcategory;
      }
    }
  }

}

class NodeMapper {

  constructor() {
    this.ids = {};
    this.count = 0;
    this.radix = 36;
  }

  getId(node) {
    const id = this.ids[node] ??
      (this.ids[node] = (this.count++).toString(this.radix));
    return this.escapeId(`n${id}`);
  }

  escapeId(id) {
    return id.
      replaceAll('end', 'End').
      replaceAll('class', 'Class');
  }

}

const registry = new TerraformRegistry();
const mapper = new NodeMapper();

async function parse(input) {
  const addresses = new Set();
  const edges = [];
  const included_default = ['var', 'local', 'output', 'data'];
  const included = [
    ...included_default,
    ...(INCLUDE ?? 'provider').split(','),
  ];
  const excluded = (EXCLUDE ?? '').split(',');
  const types = included.filter((type) => !excluded.includes(type));
  const orphan = !excluded.includes('_orphan');
  const matchesType = (node) => {
    const tokens = splitAddress(node);
    let index = 0;
    while (tokens[index] == 'module' && tokens[index + 1]) index += 2;
    const type = tokens[index];
    return Boolean(
      tokens[index + 1] &&
      (types.includes(type) || type?.match(/^[0-9a-z-]+_.+/)),
    );
  };
  const func = (node) => addresses.add(node);
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  for await (const line of rl) {
    const [src, arrow, dst] = parseStatement(await parseProvider(line));
    const srcNode = normalizeNode(src);
    if (srcNode && matchesType(srcNode)) {
      if (orphan) func(srcNode);
      if (arrow == '->') {
        if (!orphan) func(srcNode);
        const dstNode = normalizeNode(dst);
        if (dstNode && matchesType(dstNode)) {
          func(dstNode);
          edges.push([srcNode, dstNode]);
        }
      }
    }
  }
  const view = MODULE_VIEW || 'expanded';
  const manifest = ['deduplicated', 'representative'].includes(view) ?
    loadModuleManifest(TF_MODULES_FILE) :
    new Map();
  const transformed = transformModuleGraph(
    Array.from(addresses),
    edges,
    view,
    manifest,
  );
  const nodes = groupModuleSources(
    createNodes(transformed.addresses),
    transformed.groups ?? [],
  );
  const definitions = transformed.definitions.map((definition, index) => {
    const prefix = `definition:${index}|`;
    return {
      ...definition,
      id: `definition:${index}`,
      nodes: createNodes(definition.addresses, prefix),
      edges: definition.edges.map(
        (edge) => edge.map((address) => `${prefix}${address}`),
      ),
      references: definition.references.map((reference) => ({
        ...reference,
        address: `${prefix}${reference.address}`,
      })),
    };
  });
  return {
    nodes,
    edges: transformed.edges,
    definitions,
    references: [
      ...transformed.references,
      ...definitions.flatMap((definition) => definition.references),
    ],
  };
}

function createNodes(addresses, prefix = '') {
  const nodes = {};
  for (const address of addresses) {
    parseNode(nodes, splitAddress(address), `${prefix}${address}`);
  }
  return categorizeNodes(nodes);
}

function groupModuleSources(nodes, groups) {
  const sorted = groups.toSorted((left, right) =>
    splitAddress(right.parent).length - splitAddress(left.parent).length);
  for (const [index, group] of sorted.entries()) {
    let parent = nodes;
    const tokens = splitAddress(group.parent);
    for (let offset = 0; group.parent && offset < tokens.length; offset += 2) {
      const module = parent[`module.${tokens[offset + 1]}`];
      if (!module || typeof module != 'object') {
        parent = undefined;
        break;
      }
      parent = module.nodes;
    }
    if (!parent) continue;

    const grouped = {};
    for (const call of group.calls) {
      const callTokens = splitAddress(call);
      const name = `module.${callTokens.at(-1)}`;
      if (!(name in parent)) continue;
      grouped[name] = parent[name];
      delete parent[name];
    }
    if (!Object.keys(grouped).length) continue;

    parent[`module_source.${index}`] = {
      text: `Module source: ${group.label.replaceAll('"', '#quot;')}`,
      nodes: grouped,
    };
  }
  return nodes;
}

function parseStatement(line) {
  const identifiers = Array.from(
    line.matchAll(/"((?:\\.|[^"\\])*)"/g),
    (match) => match[1],
  );
  const arrow = line.includes('->') ? '->' : undefined;
  return [identifiers[0], arrow, arrow ? identifiers[1] : undefined];
}

function normalizeNode(node) {
  return node?.
    replace(/^\[[^\]]+\]\s+/, '').
    replace(/ \([^)]*\)$/, '');
}

async function parseProvider(addr) {
  const providers = new Set();
  const re = new RegExp(
    'provider\\[\\\\"([^"]+)\\\\"\\](\\.[0-9a-z-_]+)?',
    'g',
  );
  const replaced = addr.replace(re, (match, provider, alias = '') => {
    providers.add(provider);
    const escaped = provider.replaceAll('.', '_dot_');
    return `provider.${escaped}${alias}`;
  });
  const getCategories = registry.getCategories.bind(registry);
  const promises = Array.from(providers).map(getCategories);
  await Promise.all(promises);
  return replaced;
}

function parseNode(nodes, addrs, addr) {
  const prefix = addrs.shift();
  const type = prefix == 'data' ? `${prefix}.${addrs.shift()}` : prefix;
  const name = `${type}.${addrs.shift()}`;
  if (type == 'module') {
    if (addrs.length) {
      nodes[name] ??= {};
      parseNode(nodes[name], addrs, addr);
    } else {
      nodes[name] = addr;
    }
  } else {
    nodes[[name, ...addrs].join('.')] = addr;
  }
}

function categorizeNodes(nodes) {
  const categorized = {};
  for (const [name, value] of Object.entries(nodes)) {
    if (typeof value == 'object') {
      categorized[name] = {
        text: name,
        nodes: categorizeNodes(value),
      };
    } else {
      const category = registry.getCategory(name);
      if (category) {
        const replaced = category.toLowerCase().replace(/[^0-9a-z-]/g, '_');
        categorized[replaced] ??= { text: category, nodes: {} };
        categorized[replaced].nodes[name] = value;
      } else {
        categorized[name] = value;
      }
    }
  }
  return categorized;
}

function dump(comment, { nodes, edges, definitions, references }, stream) {
  dumpStatements(comment, stream);
  dumpNodes(nodes, '', stream);
  dumpDefinitions(definitions, stream);
  dumpEdges(edges, stream);
  for (const definition of definitions) dumpEdges(definition.edges, stream);
  dumpDefinitionReferences(definitions, references, stream);
}

function dumpStatements(comment, stream) {
  const init = {
    theme: 'default',
    themeVariables: {
      lineColor: '#6f7682',
      textColor: '#6f7682',
    },
  };
  const classDefs = {
    r: {
      fill: '#5c4ee5',
      stroke: '#444',
      color: '#fff',
    },
    v: {
      fill: '#eeedfc',
      stroke: '#eeedfc',
      color: '#5c4ee5',
    },
    ms: {
      fill: 'none',
      stroke: '#dce0e6',
      'stroke-width': '2px',
    },
    vs: {
      fill: 'none',
      stroke: '#dce0e6',
      'stroke-width': '4px',
      'stroke-dasharray': '10',
    },
    ps: {
      fill: 'none',
      stroke: 'none',
    },
    cs: {
      fill: '#f7f8fa',
      stroke: '#dce0e6',
      'stroke-width': '2px',
    },
  };
  const write = stream.write.bind(stream);
  write(`${comment}\n`);
  write(`%%{init:${JSON.stringify(init)}}%%\n`);
  write(`flowchart ${ORIENTATION || 'LR'}\n`);
  for (const [key, value] of Object.entries(classDefs)) {
    write(`classDef ${key} ${serialize(value)}\n`);
  }
}

function serialize(object) {
  return Object.
    entries(object).
    map(([key, value]) => `${key}:${value}`).
    join(',');
}

function dumpNodes(nodes, prefix, stream) {
  const classNames = {
    module: 'ms',
    module_source: 'ms',
    input_variables: 'vs',
    output_values: 'vs',
    padding: 'ps',
    undefined: 'cs',
  };
  const write = stream.write.bind(stream);
  for (const [name, node] of Object.entries(nodes)) {
    const type = name.split('.').shift();
    if (typeof node == 'object') {
      const title = mapper.getId(`${prefix}${name}`);
      write(`subgraph "${title}"["${node.text}"]\n`);
      if (type == 'module_source') {
        write(`direction ${ORIENTATION || 'LR'}\n`);
      }
      if (type == 'module') {
        const padding = `${title}_padding`;
        write(`subgraph "${padding}"[" "]\n`);
        dumpNodes(node.nodes, `${title}.`, stream);
        write('end\n');
        write(`class ${padding} ${classNames.padding}\n`);
      } else {
        dumpNodes(node.nodes, `${title}.`, stream);
      }
      write('end\n');
      const className = classNames[type] ?? classNames[undefined];
      write(`class ${title} ${className}\n`);
      if (type == 'module_source') {
        write(`style ${title} fill:none,stroke:#dce0e6,stroke-width:2px\n`);
      }
    } else {
      write(mapper.getId(node));
      const text = wrapText(name);
      switch (type) {
        case 'module':
          write(`["${text}"]:::v\n`);
          break;
        case 'var':
        case 'local':
        case 'output':
          write(`(["${text}"]):::v\n`);
          break;
        case 'data':
          write(`{{"${text}"}}:::r\n`);
          break;
        case 'provider':
          write(`[/"${wrapText(unparseProvider(name))}"\\]\n`);
          break;
        default:
          write(`["${text}"]:::r\n`);
      }
    }
  }
}

function dumpDefinitions(definitions, stream) {
  if (!definitions.length) return;
  const root = mapper.getId('module-definitions');
  stream.write(`subgraph "${root}"["Module definitions"]\n`);
  stream.write(`direction ${ORIENTATION || 'LR'}\n`);
  for (const definition of definitions) {
    const title = mapper.getId(definition.id);
    const label = definition.label.replaceAll('"', '#quot;');
    stream.write(`subgraph "${title}"["${label}"]\n`);
    stream.write(`direction ${ORIENTATION || 'LR'}\n`);
    dumpNodes(definition.nodes, `${title}.`, stream);
    stream.write('end\n');
    stream.write(`class ${title} ms\n`);
    stream.write(`style ${title} fill:none,stroke:#dce0e6,stroke-width:2px\n`);
  }
  stream.write('end\n');
  stream.write(`class ${root} ms\n`);
}

function dumpDefinitionReferences(definitions, references, stream) {
  const targets = new Map(
    definitions.map((definition) => [definition.identity, definition.id]),
  );
  for (const reference of references) {
    const target = targets.get(reference.identity);
    if (target) {
      const edge = arrangeEdge([reference.address, target]);
      stream.write(`${edge.map((address) => mapper.getId(address)).join('-.->')}\n`);
    }
  }
}

function wrapText(text) {
  if (text.length < 30) return text;
  if (text.includes('[')) {
    return text.
      replaceAll('[', '<br/>[').
      replaceAll('].', '].<br/>');
  } else {
    return text.replaceAll('.', '.<br/>');
  }
}

function unparseProvider(name) {
  const [, provider, alias] = name.split('.');
  const unescaped = provider.replaceAll('_dot_', '.');
  return [`provider[#quot;${unescaped}#quot;]`, alias].
    filter(Boolean).
    join('.');
}

function dumpEdges(edges, stream) {
  const getId = mapper.getId.bind(mapper);
  const logicalAddress = (address) => address.split('|').at(-1);
  const arrow = ([src, dst]) =>
    logicalAddress(src).startsWith('output.') ||
      logicalAddress(dst).startsWith('var.') ?
      `${'-'.repeat(ARROW_LENGTH || 2)}->` :
      '-->';
  for (const edge of edges) {
    stream.write(arrangeEdge(edge).map(getId).join(arrow(edge)) + '\n');
  }
}

function arrangeEdge([source, destination]) {
  return ARROW_DIRECTION == 'reverse' ?
    [destination, source] :
    [source, destination];
}

async function embed(fileName, comment, graph, stream) {
  const input = fs.createReadStream(fileName);
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  let quoting = false;
  let commented = false;
  for await (const line of rl) {
    switch (line) {
      case '```mermaid':
        quoting = true;
        break;
      case comment:
        if (quoting) {
          commented = true;
          dump(comment, graph, stream);
          continue;
        }
        break;
      case '```':
        quoting = false;
        commented = false;
        break;
    }
    if (!commented) stream.write(`${line}\n`);
  }
}

const [, , fileName, label] = argv;
const comment = ['%%tfmermaid', label].filter(Boolean).join(':');
const graph = await parse(stdin);

if (fileName) {
  embed(fileName, comment, graph, stdout);
} else {
  dump(comment, graph, stdout);
}
