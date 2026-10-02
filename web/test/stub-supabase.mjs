// Records every call the action makes, and replays a scripted response.
export const log = [];
export let script = {};
export function setScript(s) { script = s; log.length = 0; }

function builder(table) {
  const q = { table, op: null, payload: null, filters: {}, selected: null, ordered: null, limited: null };
  const self = {
    select(cols) { q.op ??= "select"; q.selected = cols; return self; },
    insert(p) { q.op = "insert"; q.payload = p; return self; },
    update(p) { q.op = "update"; q.payload = p; return self; },
    delete() { q.op = "delete"; return self; },
    eq(col, val) { q.filters[col] = val; return self; },
    order(col, opts) { q.ordered = [col, opts]; return self; },
    limit(n) { q.limited = n; return self; },
    maybeSingle() { return finish(true); },
    then(res, rej) { return finish(false).then(res, rej); },
  };
  function finish(single) {
    log.push(q);
    const key = `${q.op}:${q.table}${single ? ":single" : ""}`;
    const r = script[key] ?? { data: single ? null : [], error: null };
    return Promise.resolve(r);
  }
  return self;
}

export async function createClient() {
  return {
    from: (table) => builder(table),
    rpc(name, args) {
      log.push({ op: "rpc", name, args });
      return Promise.resolve(script[`rpc:${name}`] ?? { data: null, error: null });
    },
  };
}
