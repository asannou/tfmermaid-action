import fs from 'node:fs';
import path from 'node:path';

const views = new Set([
  'expanded',
  'compact',
  'deduplicated',
  'representative',
]);

export function loadModuleManifest(fileName) {
  if (!fileName) {
    throw new Error('Module metadata is unavailable for this module view.');
  }
  const manifest = JSON.parse(fs.readFileSync(fileName, 'utf8'));
  const modules = new Map();

  for (const entry of manifest.Modules ?? []) {
    if (!entry.Key) continue;

    const source = entry.Source;
    const version = entry.Version ?? '';
    let identity;
    if (source.startsWith('./') || source.startsWith('../')) {
      let directory = path.resolve(entry.Dir);
      try {
        directory = fs.realpathSync(directory);
      } catch {
        // Keep the resolved path so malformed metadata still remains distinct.
      }
      identity = `directory:${directory}`;
    } else {
      identity = `source:${source}@${version}`;
    }

    modules.set(entry.Key, {
      identity,
      label: [source, version].filter(Boolean).join('@'),
    });
  }

  return modules;
}

export function splitAddress(address) {
  const tokens = [];
  let token = '';
  let brackets = 0;
  let quoted = false;
  let escaped = false;

  for (const character of address) {
    if (escaped) {
      token += character;
      escaped = false;
      continue;
    }
    if (character == '\\' && quoted) {
      token += character;
      escaped = true;
      continue;
    }
    if (character == '"' && brackets) {
      token += character;
      quoted = !quoted;
      continue;
    }
    if (!quoted && character == '[') brackets++;
    if (!quoted && character == ']') brackets--;
    if (character == '.' && brackets == 0) {
      tokens.push(token);
      token = '';
    } else {
      token += character;
    }
  }
  tokens.push(token);
  return tokens;
}

function moduleCalls(address) {
  const tokens = splitAddress(address);
  const addressTokens = [];
  const keyParts = [];
  const calls = [];

  for (let index = 0; index < tokens.length - 1; index += 2) {
    if (tokens[index] != 'module') break;
    const instance = tokens[index + 1];
    addressTokens.push('module', instance);
    keyParts.push(instance.replace(/\[.*\]$/, ''));
    calls.push({
      address: addressTokens.join('.'),
      key: keyParts.join('.'),
    });
  }
  return calls;
}

function uniqueEdges(edges) {
  const seen = new Set();
  return edges.filter(([source, destination]) => {
    if (source == destination) return false;
    const key = `${source}\0${destination}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function transform(addresses, edges, mapper) {
  return {
    addresses: Array.from(new Set(addresses.map(mapper))),
    edges: uniqueEdges(edges.map(([source, destination]) => [
      mapper(source),
      mapper(destination),
    ])),
  };
}

function contractGraph(addresses, edges, retained) {
  const retainedAddresses = addresses.filter(retained);
  const retainedSet = new Set(retainedAddresses);
  const adjacency = new Map();
  for (const [source, destination] of edges) {
    adjacency.set(source, adjacency.get(source) ?? []);
    adjacency.get(source).push(destination);
  }

  const contractedEdges = [];
  for (const source of retainedAddresses) {
    const pending = [...(adjacency.get(source) ?? [])];
    const visited = new Set();
    while (pending.length) {
      const destination = pending.shift();
      if (visited.has(destination)) continue;
      visited.add(destination);
      if (retainedSet.has(destination)) {
        contractedEdges.push([source, destination]);
      } else {
        pending.push(...(adjacency.get(destination) ?? []));
      }
    }
  }

  return {
    addresses: retainedAddresses,
    edges: uniqueEdges(contractedEdges),
  };
}

function stripModulePrefix(address, prefix) {
  return address.slice(prefix.length + 1);
}

export function transformModuleGraph(
  addresses,
  edges,
  view = 'expanded',
  manifest = new Map(),
) {
  if (!views.has(view)) {
    throw new Error(
      `Unsupported module view: ${view}. Expected expanded, compact, deduplicated, or representative.`,
    );
  }

  if (view == 'expanded') {
    return { addresses, edges, definitions: [], references: [] };
  }

  if (view == 'compact') {
    const compact = (address) => moduleCalls(address)[0]?.address ?? address;
    return {
      ...transform(addresses, edges, compact),
      definitions: [],
      references: [],
    };
  }

  const callsByIdentity = new Map();
  for (const address of addresses) {
    for (const call of moduleCalls(address)) {
      const metadata = manifest.get(call.key);
      if (!metadata) continue;
      callsByIdentity.set(
        metadata.identity,
        callsByIdentity.get(metadata.identity) ?? new Map(),
      );
      callsByIdentity.get(metadata.identity).set(call.address, {
        ...call,
        ...metadata,
      });
    }
  }

  const repeated = new Set(
    Array.from(callsByIdentity).
      filter(([, calls]) => calls.size > 1).
      map(([identity]) => identity),
  );
  if (view == 'representative') {
    const omittedCalls = new Set();
    for (const identity of repeated) {
      const calls = Array.from(callsByIdentity.get(identity).keys()).sort();
      for (const call of calls.slice(1)) omittedCalls.add(call);
    }
    const retained = (address) => {
      const omitted = moduleCalls(address).
        find((call) => omittedCalls.has(call.address));
      if (!omitted) return true;
      const internal = stripModulePrefix(address, omitted.address);
      const type = splitAddress(internal)[0];
      return type == 'var' || type == 'output';
    };
    return {
      ...contractGraph(addresses, edges, retained),
      definitions: [],
      references: [],
    };
  }
  const collapsedCall = (address, ancestor = '') => {
    for (const call of moduleCalls(address)) {
      if (ancestor && !call.address.startsWith(`${ancestor}.`)) continue;
      const metadata = manifest.get(call.key);
      if (metadata && repeated.has(metadata.identity)) return call.address;
    }
    return undefined;
  };
  const main = transform(
    addresses,
    edges,
    (address) => collapsedCall(address) ?? address,
  );
  const findReference = (address) => {
    const call = moduleCalls(address).at(-1);
    if (!call || call.address != address) return undefined;
    const metadata = manifest.get(call.key);
    if (!metadata || !repeated.has(metadata.identity)) return undefined;
    return { address, identity: metadata.identity };
  };
  const references = main.addresses.map(findReference).filter(Boolean);

  const definitions = [];
  for (const identity of Array.from(repeated).sort()) {
    const calls = Array.from(callsByIdentity.get(identity).values()).
      sort((left, right) => left.address.localeCompare(right.address));
    const representative = calls[0];
    const isInternal = (address) => address.startsWith(`${representative.address}.`);
    const internalAddresses = addresses.filter(isInternal);
    if (!internalAddresses.length) continue;

    const mapInternal = (address) => {
      const nested = collapsedCall(address, representative.address);
      return stripModulePrefix(nested ?? address, representative.address);
    };
    const internalEdges = edges.filter(
      ([source, destination]) => isInternal(source) && isInternal(destination),
    );
    const definition = transform(internalAddresses, internalEdges, mapInternal);
    const definitionReferences = definition.addresses.
      map((address) => findReference(`${representative.address}.${address}`)).
      filter(Boolean).
      map((reference) => ({
        ...reference,
        address: stripModulePrefix(reference.address, representative.address),
      }));
    definitions.push({
      identity,
      label: representative.label,
      references: definitionReferences,
      ...definition,
    });
  }

  return { ...main, definitions, references };
}
