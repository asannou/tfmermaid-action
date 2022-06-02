#!/usr/bin/env node

import { argv, env, stdin, stdout } from 'process';
import { PassThrough } from 'stream';
import fs from 'fs';
import readline from 'readline/promises';

const { ORIENTATION, ARROW_DIRECTION, ARROW_LENGTH, EXCLUDE, INCLUDE } = env;

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
  const nodes = {};
  const edges = [];
  const included_default = ['var', 'local', 'output', 'data'];
  const included = [
    ...included_default,
    ...(INCLUDE ?? 'provider').split(','),
  ];
  const excluded = (EXCLUDE ?? '').split(',');
  const types = included.filter((type) => !excluded.includes(type));
  const orphan = !excluded.includes('_orphan');
  const re = new RegExp(
    '^(module\\.[^. ]+\\.)*' +
    '(' + types.join('|') + '|[0-9a-z-]+_.+)\\.'
  );
  const func = (node) => parseNode(nodes, node.split('.'), node);
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  for await (const line of rl) {
    const [, src, arrow, dst] = (await parseProvider(line)).split('"');
    const [, srcNode] = (src ?? '').split(' ');
    if (srcNode && srcNode.match(re)) {
      if (orphan) func(srcNode);
      if (arrow.trim() == '->') {
        if (!orphan) func(srcNode);
        const [, dstNode] = dst.split(' ');
        if (dstNode.match(re)) {
          func(dstNode);
          edges.push([srcNode, dstNode]);
        }
      }
    }
  }
  return {
    nodes: categorizeNodes(nodes),
    edges,
  };
}

async function parseProvider(addr) {
  const providers = new Set();
  const re = new RegExp('provider\\[\\\\"([^"]+)\\\\"\\](\\.[0-9a-z-_]+)?');
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

function dump(comment, { nodes, edges }, stream) {
  dumpStatements(comment, stream);
  dumpNodes(nodes, '', stream);
  dumpEdges(edges, stream);
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
    } else {
      write(mapper.getId(node));
      const text = wrapText(name);
      switch (type) {
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
  return [`provider[&quot;${unescaped}&quot;]`, alias].
    filter(Boolean).
    join('.');
}

function dumpEdges(edges, stream) {
  const arrange = ARROW_DIRECTION == 'reverse' ?
    ([src, dst]) => [dst, src] :
    (edge) => edge;
  const getId = mapper.getId.bind(mapper);
  const arrow = ([src, dst]) =>
    src.startsWith('output.') || dst.startsWith('var.') ?
      `${'-'.repeat(ARROW_LENGTH || 2)}->` :
      '-->';
  for (const edge of edges) {
    stream.write(arrange(edge).map(getId).join(arrow(edge)) + '\n');
  }
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

