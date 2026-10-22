import { useEffect, useMemo, useRef, useState } from "react";
import { initialDays, phases, statusOptions } from "./data";
import {
  isPassphraseConfigured,
  isUnlocked,
  setUnlocked,
  verifyPassphrase,
} from "./lib/access";
import {
  isRemoteEnabled,
  loadRemote,
  mergeAndSaveRemote,
  mergeDays,
  normalizeDays,
  signature,
  subscribeRemote,
} from "./lib/remote";
import "./styles.css";

const STORAGE_KEY = "suniti-pre-wedding-planner-v1";
const clone = (value) => JSON.parse(JSON.stringify(value));
const SAVE_DEBOUNCE_MS = 700;

const SYNC_LABELS = {
  local: "Saved in this browser",
  connecting: "Connecting to the shared plan…",
  synced: "Saved to the shared plan",
  saving: "Saving to the shared plan…",
  offline: "Offline. Kept on this device",
};

function readSaved() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : clone(initialDays);
  } catch {
    return clone(initialDays);
  }
}

function formatDateLabel(id, fallback) {
  if (id === "thu") return "Thursday · May 6";
  if (id === "fri") return "Friday · May 7";
  if (id === "sat") return "Saturday · May 8";
  if (id === "sun") return "Sunday · May 9";
  return fallback;
}

function App() {
  const [days, setDays] = useState(readSaved);
  const [activeId, setActiveId] = useState("months");
  const [showCompleted, setShowCompleted] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [newGroup, setNewGroup] = useState("General");
  const [editingTitle, setEditingTitle] = useState(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [syncState, setSyncState] = useState(isRemoteEnabled() ? "connecting" : "local");
  const lastPushed = useRef(null);
  const passphraseRequired = isPassphraseConfigured();
  const [unlocked, setUnlockedState] = useState(isUnlocked());
  const [showPassphraseForm, setShowPassphraseForm] = useState(false);
  const [passphraseInput, setPassphraseInput] = useState("");
  const [passphraseError, setPassphraseError] = useState("");
  const canEdit = !passphraseRequired || unlocked;

  // The browser copy is a cache and an offline fallback. When a shared database
  // is configured the server copy is the source of truth.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
  }, [days]);

  // Load the shared plan once on startup, then keep it up to date.
  useEffect(() => {
    if (!isRemoteEnabled()) return undefined;
    let cancelled = false;

    async function pull() {
      try {
        const remote = await loadRemote();
        if (cancelled) return;
        if (remote) {
          setDays((current) => {
            const merged = mergeDays(current, remote);
            return signature(current) === signature(merged) ? current : merged;
          });
        }
        setSyncState("synced");
      } catch {
        if (!cancelled) setSyncState("offline");
      }
    }

    pull();
    const unsubscribe = subscribeRemote(pull);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // Push changes to the shared plan, a moment after the last edit.
  useEffect(() => {
    if (!isRemoteEnabled()) return undefined;
    if (!canEdit) return undefined;
    const current = signature(days);
    if (current === lastPushed.current) return undefined;

    setSyncState("saving");
    const timer = setTimeout(async () => {
      try {
        const merged = await mergeAndSaveRemote(days);
        lastPushed.current = signature(merged ?? days);
        setSyncState("synced");
      } catch {
        setSyncState("offline");
      }
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [days, canEdit]);

  const phase = phases.find((item) => item.id === activeId) ?? phases[0];
  const activeDay = days[activeId];

  const allItems = useMemo(
    () =>
      Object.values(days).flatMap((day) =>
        day.groups.flatMap((group) => group.items).filter((item) => !item.deleted)
      ),
    [days]
  );
  const completedCount = allItems.filter((item) => item.status === "Done").length;
  const totalCount = allItems.length;
  const progress = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  function requireEdit() {
    if (canEdit) return true;
    setShowPassphraseForm(true);
    setPassphraseError("Enter the passphrase to make changes.");
    return false;
  }

  function unlockWithPassphrase(event) {
    event.preventDefault();
    if (verifyPassphrase(passphraseInput)) {
      setUnlocked(true);
      setUnlockedState(true);
      setShowPassphraseForm(false);
      setPassphraseInput("");
      setPassphraseError("");
      return;
    }
    setPassphraseError("Incorrect passphrase.");
  }

  function lockPlan() {
    setUnlocked(false);
    setUnlockedState(false);
    setShowPassphraseForm(false);
    setPassphraseInput("");
    setPassphraseError("");
  }

  function updateItem(itemId, patch) {
    if (!requireEdit()) return;
    const now = Date.now();
    setDays((current) => ({
      ...current,
      [activeId]: {
        ...current[activeId],
        groups: current[activeId].groups.map((group) => ({
          ...group,
          items: group.items.map((item) => item.id === itemId ? { ...item, ...patch, updatedAt: now } : item),
        })),
      },
    }));
  }

  function toggleDone(item) {
    updateItem(item.id, { status: item.status === "Done" ? "Not started" : "Done" });
  }

  function addTask(event) {
    event.preventDefault();
    if (!requireEdit()) return;
    const title = newTask.trim();
    if (!title) return;
    const id = `custom-${Date.now()}`;
    const now = Date.now();
    const item = { id, title, status: "Not started", detail: "", time: "", owner: "", location: "", updatedAt: now, deleted: false };
    setDays((current) => {
      const day = current[activeId];
      const groupExists = day.groups.some((group) => group.title === newGroup);
      return {
        ...current,
        [activeId]: {
          ...day,
          groups: groupExists
            ? day.groups.map((group) => group.title === newGroup
              ? { ...group, items: [...group.items, item] }
              : group)
            : [...day.groups, { title: newGroup, items: [item] }],
        },
      };
    });
    setNewTask("");
  }

  // Deleting keeps a tombstone so the removal is not undone by the next merge
  // with the shared copy.
  function deleteTask(itemId) {
    if (!requireEdit()) return;
    const now = Date.now();
    setDays((current) => ({
      ...current,
      [activeId]: {
        ...current[activeId],
        groups: current[activeId].groups.map((group) => ({
          ...group,
          items: group.items.map((item) => item.id === itemId ? { ...item, deleted: true, updatedAt: now } : item),
        })),
      },
    }));
  }

  function renameTask(item) {
    if (!requireEdit()) {
      setEditingTitle(null);
      return;
    }
    const title = titleDraft.trim();
    if (title) updateItem(item.id, { title });
    setEditingTitle(null);
  }

  function resetProgress() {
    if (!requireEdit()) return;
    if (window.confirm("Reset every task and edit to the original starter plan? This cannot be undone.")) {
      // Stamp the restored plan as the newest version, otherwise the next merge
      // would bring the old shared copy straight back.
      const now = Date.now();
      const fresh = clone(initialDays);
      for (const dayId of Object.keys(fresh)) {
        fresh[dayId] = {
          ...fresh[dayId],
          groups: fresh[dayId].groups.map((group) => ({
            ...group,
            items: group.items.map((item) => ({ ...item, updatedAt: now, deleted: false })),
          })),
        };
      }
      setDays(normalizeDays(fresh));
      setActiveId("months");
    }
  }

  const visibleGroups = activeDay.groups.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.deleted && (showCompleted || item.status !== "Done")),
  }));

  const activeItemCount = activeDay.groups.reduce(
    (sum, group) => sum + group.items.filter((item) => !item.deleted).length,
    0
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">s<span>+</span></div>
          <div>
            <div className="brand-name">Suniti's</div>
            <div className="brand-subtitle">PRE WEDDING PLAN</div>
          </div>
        </div>

        <div className="nav-label">THE TIMELINE</div>
        <nav className="phase-nav" aria-label="Planning timeline">
          {phases.map((item, index) => {
            const count = days[item.id].groups.flatMap((group) => group.items).filter((task) => !task.deleted).length;
            const done = days[item.id].groups.flatMap((group) => group.items).filter((task) => !task.deleted && task.status === "Done").length;
            return (
              <button
                className={`phase-link ${activeId === item.id ? "active" : ""}`}
                key={item.id}
                onClick={() => setActiveId(item.id)}
                aria-current={activeId === item.id ? "page" : undefined}
              >
                <span className="phase-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="phase-link-copy">
                  <span className="phase-link-title">{item.label}</span>
                  <span className="phase-link-meta">{item.eyebrow}</span>
                </span>
                <span className={`phase-count ${done === count && count ? "all-done" : ""}`}>{done}/{count}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="progress-heading">
            <span>Overall progress</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          <p>{completedCount} of {totalCount} items complete</p>
          <div className={`save-note save-${canEdit ? syncState : "local"}`}><span className="save-dot" /> {canEdit ? (SYNC_LABELS[syncState] ?? SYNC_LABELS.local) : "Read Only"}</div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumb"><span>Pre wedding</span><span className="crumb-slash">/</span><strong>{phase.label}</strong></div>
          <div className="topbar-actions">
            {passphraseRequired && (
              unlocked ? (
                <button className="quiet-button" onClick={lockPlan} title="Lock the plan back to Read Only">Lock</button>
              ) : (
                <button className="quiet-button" onClick={() => { setShowPassphraseForm((value) => !value); setPassphraseError(""); setPassphraseInput(""); }} title="Enter the passphrase to edit the plan">Edit plan</button>
              )
            )}
            <button className="quiet-button" onClick={resetProgress} title="Restore the original starter plan" disabled={!canEdit}>Reset plan</button>
          </div>
        </header>

        <section className="page-content">
          <div className="eyebrow">{phase.eyebrow}</div>
          <div className="page-heading-row">
            <div>
              <h1>{phase.title}</h1>
              <p className="page-description">{phase.description}</p>
            </div>
            <div className="date-pill"><span className="date-icon">◷</span>{formatDateLabel(activeId, activeDay.dateLabel)}</div>
          </div>

          {passphraseRequired && !unlocked && (
            <div className="read-only-banner">
              <div><strong>Read Only.</strong><p>Anyone can read the shared plan. Click <em>Edit plan</em> and enter the passphrase to mark items done or make changes.</p></div>
              {showPassphraseForm && (
                <form className="passphrase-form" onSubmit={unlockWithPassphrase}>
                  <input type="password" value={passphraseInput} onChange={(e) => setPassphraseInput(e.target.value)} placeholder="Passphrase" aria-label="Passphrase" autoFocus />
                  <button type="submit">Unlock</button>
                  {passphraseError && <span className="passphrase-error">{passphraseError}</span>}
                </form>
              )}
            </div>
          )}

          {activeId === "sun" && (
            <div className="callout blue-callout">
              <span className="callout-icon">◷</span>
              <div><strong>The detailed Sunday schedule is still to be added.</strong><p>The original workbook only specified a 3:00 AM start. The checklist below preserves the known essentials without inventing ceremony timings.</p></div>
            </div>
          )}

          <div className="section-toolbar">
            <div className="section-heading"><h2>Plan for this stage</h2><span className="item-total">{activeItemCount} items</span></div>
            <label className="toggle-label"><input type="checkbox" checked={showCompleted} onChange={(e) => setShowCompleted(e.target.checked)} /> Show completed</label>
          </div>

          <div className="timeline-groups">
            {visibleGroups.map((group, groupIndex) => (
              <section className="task-group" key={group.title}>
                <div className="group-rail"><span className="group-dot">{String(groupIndex + 1).padStart(2, "0")}</span><span className="group-line" /></div>
                <div className="group-body">
                  <div className="group-title-row"><h3>{group.title}</h3><span>{group.items.filter((item) => item.status === "Done").length}/{group.items.length} complete</span></div>
                  <div className="task-list">
                    {group.items.map((item) => (
                      <article className={`task-card ${item.status === "Done" ? "task-done" : ""}`} key={item.id}>
                        <button className="check-button" onClick={() => toggleDone(item)} aria-label={item.status === "Done" ? `Mark ${item.title} incomplete` : `Mark ${item.title} complete`} aria-pressed={item.status === "Done"} disabled={!canEdit}>
                          {item.status === "Done" ? "✓" : ""}
                        </button>
                        <div className="task-main">
                          <div className="task-title-row">
                            {editingTitle === item.id ? (
                              <form className="rename-form" onSubmit={(e) => { e.preventDefault(); renameTask(item); }}>
                                <input autoFocus value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)} onBlur={() => renameTask(item)} />
                              </form>
                            ) : (
                              <button className="task-title" onClick={() => { if (!canEdit) { requireEdit(); return; } setEditingTitle(item.id); setTitleDraft(item.title); }} title={canEdit ? "Click to edit task name" : "Read Only"}>{item.title}</button>
                            )}
                            <select className={`status-select status-${(item.status || "Not started").toLowerCase().replaceAll(" ", "-")}`} value={item.status || "Not started"} onChange={(e) => updateItem(item.id, { status: e.target.value })} aria-label={`Status for ${item.title}`} disabled={!canEdit}>
                              {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                            </select>
                          </div>
                          {item.detail && <p className="task-detail">{item.detail}</p>}
                          {(item.time || item.owner || item.location) && (
                            <div className="task-meta">
                              {item.time && <span><span className="meta-symbol">◷</span>{item.time}</span>}
                              {item.owner && <span><span className="meta-symbol">♙</span>{item.owner}</span>}
                              {item.location && <span><span className="meta-symbol">⌖</span>{item.location}</span>}
                            </div>
                          )}
                        </div>
                        <button className="delete-task" onClick={() => deleteTask(item.id)} aria-label={`Remove ${item.title}`} title={canEdit ? "Remove item" : "Read Only"} disabled={!canEdit}>×</button>
                      </article>
                    ))}
                    {group.items.length === 0 && <p className="empty-group">Everything in this group is complete.</p>}
                  </div>
                </div>
              </section>
            ))}
          </div>

          <form className="add-task-form" onSubmit={addTask}>
            <div className="add-task-icon">+</div>
            <input value={newTask} onChange={(e) => { if (!canEdit) { requireEdit(); return; } setNewTask(e.target.value); }} onFocus={() => { if (!canEdit) requireEdit(); }} placeholder={canEdit ? "Add a task to this stage…" : "Read Only. Enter passphrase to add tasks"} aria-label="New task" disabled={!canEdit} />
            <select value={newGroup} onChange={(e) => setNewGroup(e.target.value)} aria-label="Task group" disabled={!canEdit}>
              {activeDay.groups.map((group) => <option key={group.title} value={group.title}>{group.title}</option>)}
              <option value="General">General</option>
            </select>
            <button type="submit" className="add-button" disabled={!canEdit || !newTask.trim()}>Add task</button>
          </form>

          <footer className="page-footer">
            <span>Keep it clear. Keep it moving.</span>
            <div className="footer-nav">
              <button onClick={() => setActiveId(phases[Math.max(0, phases.findIndex((p) => p.id === activeId) - 1)].id)} disabled={activeId === phases[0].id}>← Previous</button>
              <button onClick={() => setActiveId(phases[Math.min(phases.length - 1, phases.findIndex((p) => p.id === activeId) + 1)].id)} disabled={activeId === phases[phases.length - 1].id}>Next stage →</button>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
