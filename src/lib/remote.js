// Shared plan state, stored as one JSON document in a Firebase Realtime Database.
//
// Shape written to <db>/plan.json:
//   { version: 1, updatedAt: <ms>, days: { <dayId>: { dateLabel, groups: [ { title, items: [...] } ] } } }
//
// The database URL comes from VITE_FIREBASE_DB_URL (see .env.example). When that
// variable is missing the app stays fully local and everything below is a no-op.

const PLAN_PATH = "plan";
const PLAN_VERSION = 1;

function readEnv() {
  // Vite replaces import.meta.env at build time. The global fallback lets this
  // module run outside a bundler, which is what the tests rely on.
  if (typeof import.meta.env !== "undefined" && import.meta.env) return import.meta.env;
  return globalThis.__APP_ENV__ ?? {};
}

function baseUrl() {
  const env = readEnv();
  const raw = env.VITE_FIREBASE_DB_URL;
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim().replace(/\/+$/, "");
  return trimmed || null;
}

export function isRemoteEnabled() {
  return Boolean(baseUrl());
}

// --- normalising -------------------------------------------------------------
// Every object is rebuilt with a fixed key order so that JSON.stringify can be
// used as a cheap "did anything actually change?" check.

export function normalizeItem(item) {
  return {
    id: item.id,
    title: item.title ?? "",
    status: item.status ?? "Not started",
    detail: item.detail ?? "",
    time: item.time ?? "",
    owner: item.owner ?? "",
    location: item.location ?? "",
    updatedAt: item.updatedAt ?? 0,
    deleted: Boolean(item.deleted),
  };
}

export function normalizeDays(days) {
  const out = {};
  for (const dayId of Object.keys(days ?? {})) {
    const day = days[dayId] ?? {};
    out[dayId] = {
      dateLabel: day.dateLabel ?? "",
      groups: (day.groups ?? []).map((group) => ({
        title: group.title ?? "",
        items: (group.items ?? []).map(normalizeItem),
      })),
    };
  }
  return out;
}

export function signature(days) {
  return JSON.stringify(normalizeDays(days));
}

// --- merging -----------------------------------------------------------------
// Two people can edit at the same time, so a plain "last write wins" would drop
// somebody's checkbox. Instead every item carries an updatedAt timestamp and the
// newer version of each item wins. Items only ever exist in one of the two
// copies, so additions from either side survive.

const STATUS_ORDER = ["Not started", "In progress", "Waiting", "Planned", "Decided", "Done"];

function statusRank(status) {
  const index = STATUS_ORDER.indexOf(status);
  return index === -1 ? 0 : index;
}

function newerItem(a, b) {
  const timeA = a.updatedAt ?? 0;
  const timeB = b.updatedAt ?? 0;
  if (timeB > timeA) return b;
  if (timeA > timeB) return a;
  // Same timestamp: prefer whichever status is further along.
  return statusRank(b.status) >= statusRank(a.status) ? b : a;
}

function mergeItems(localItems, remoteItems) {
  const order = [];
  const byId = new Map();
  for (const item of [...(localItems ?? []), ...(remoteItems ?? [])]) {
    if (!item || !item.id) continue;
    if (!byId.has(item.id)) {
      byId.set(item.id, normalizeItem(item));
      order.push(item.id);
      continue;
    }
    byId.set(item.id, newerItem(byId.get(item.id), normalizeItem(item)));
  }
  return order.map((id) => byId.get(id));
}

function mergeGroups(localGroups, remoteGroups) {
  const order = [];
  const byTitle = new Map();
  for (const group of [...(localGroups ?? []), ...(remoteGroups ?? [])]) {
    if (!group) continue;
    const title = group.title ?? "";
    if (!byTitle.has(title)) {
      byTitle.set(title, { title, items: [] });
      order.push(title);
    }
    const current = byTitle.get(title);
    current.items = mergeItems(current.items, group.items);
  }
  return order.map((title) => byTitle.get(title));
}

export function mergeDays(local, remote) {
  const left = normalizeDays(local);
  const right = normalizeDays(remote);
  const out = {};
  const dayIds = [...Object.keys(left), ...Object.keys(right)].filter(
    (id, index, all) => all.indexOf(id) === index
  );
  for (const dayId of dayIds) {
    const localDay = left[dayId];
    const remoteDay = right[dayId];
    if (!localDay) {
      out[dayId] = remoteDay;
      continue;
    }
    if (!remoteDay) {
      out[dayId] = localDay;
      continue;
    }
    out[dayId] = {
      dateLabel: remoteDay.dateLabel || localDay.dateLabel,
      groups: mergeGroups(localDay.groups, remoteDay.groups),
    };
  }
  return out;
}

// --- network -----------------------------------------------------------------

export async function loadRemote() {
  const base = baseUrl();
  if (!base) return null;
  const response = await fetch(`${base}/${PLAN_PATH}.json`);
  if (!response.ok) throw new Error(`Could not load the shared plan (${response.status}).`);
  const payload = await response.json();
  if (!payload || typeof payload !== "object" || !payload.days) return null;
  return normalizeDays(payload.days);
}

async function writeRemote(days) {
  const base = baseUrl();
  if (!base) return;
  const payload = { version: PLAN_VERSION, updatedAt: Date.now(), days: normalizeDays(days) };
  const response = await fetch(`${base}/${PLAN_PATH}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Could not save the shared plan (${response.status}).`);
}

// Read, merge, then write. Merging first means a change made by someone else
// while you were editing is not thrown away by your save.
export async function mergeAndSaveRemote(localDays) {
  const base = baseUrl();
  if (!base) return null;
  let remote = null;
  try {
    remote = await loadRemote();
  } catch {
    // Offline, or the database is unreachable: fall back to writing our copy.
  }
  const merged = remote ? mergeDays(localDays, remote) : normalizeDays(localDays);
  await writeRemote(merged);
  return merged;
}

// --- live updates ------------------------------------------------------------
// The Realtime Database can stream changes over plain server-sent events, so
// someone else's checkbox shows up without a refresh.

export function subscribeRemote(onChange) {
  const base = baseUrl();
  if (!base) return () => {};

  let source = null;
  let cancelled = false;

  // Classic *.firebaseio.com hosts stream straight from the root. Regional
  // hosts (project-default-rtdb.region.firebasedatabase.app) need an explicit
  // namespace, which is fetched separately.
  async function resolveStreamUrl() {
    try {
      const probe = await fetch(`${base}/.json`, { headers: { Accept: "text/event-stream" } });
      const type = probe.headers.get("content-type") || "";
      probe.body?.cancel();
      if (probe.ok && type.includes("text/event-stream")) return `${base}/.json`;
    } catch {
      // Fall through to the namespace route.
    }

    try {
      const nsProbe = await fetch(`${base}/.json?ns=`, { headers: { Accept: "text/event-stream" } });
      const nsType = nsProbe.headers.get("content-type") || "";
      if (!nsProbe.ok) {
        nsProbe.body?.cancel();
        return null;
      }
      if (nsType.includes("text/event-stream")) {
        nsProbe.body?.cancel();
        return `${base}/.json`;
      }
      const namespace = (await nsProbe.text()).trim();
      return namespace ? `${base}/.json?ns=${encodeURIComponent(namespace)}` : null;
    } catch {
      return null;
    }
  }

  async function connect() {
    const url = await resolveStreamUrl();
    if (!url || cancelled) return;

    source = new EventSource(url);

    let pending = null;
    const schedule = () => {
      if (pending) return;
      pending = setTimeout(() => {
        pending = null;
        onChange();
      }, 250);
    };

    for (const eventName of ["put", "patch"]) {
      source.addEventListener(eventName, schedule);
    }
    source.addEventListener("error", () => {
      // The stream dropped. The app keeps working, it just stops live updating.
      source?.close();
      source = null;
    });
  }

  connect();

  return () => {
    cancelled = true;
    if (pending) clearTimeout(pending);
    source?.close();
  };
}
