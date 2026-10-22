// Who is allowed to change the shared plan.
//
// The plan is readable by everyone, so the shared database URL is shipped in
// the browser bundle. That is fine for reading, but it also means anyone can
// write to the database directly. This module adds a passphrase gate on top:
// without the passphrase the app works in read-only mode and never writes to
// the database at all.
//
// The passphrase itself is never stored in the app. The bundle carries only a
// SHA-256 hash of it, and the browser hashes what you type and compares. The
// comparison happens on the client, so this stops accidental edits and casual
// tinkering rather than a determined attacker: the database URL is still
// visible in the bundle and the rules still accept writes.
//
// Configuration:
//   VITE_OWNER_PASSPHRASE_HASH  sha256 hex of the passphrase (64 characters)
//   node -e "console.log(require('crypto').createHash('sha256').update('my phrase').digest('hex'))"

import { readEnv } from "./env.js";
import { sha256Hex } from "./sha256.js";

const SESSION_KEY = "suniti-pre-wedding-planner-owner";
const HASH_VAR = "VITE_OWNER_PASSPHRASE_HASH";

export function ownerHash() {
  const raw = readEnv()[HASH_VAR];
  return typeof raw === "string" ? raw.trim().toLowerCase() : "";
}

// Without a configured hash there is no gate, so the app stays fully editable.
// That is what happens in local development before the variable is set.
export function isPassphraseConfigured() {
  return ownerHash().length === 64;
}

export function isUnlocked() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "unlocked";
  } catch {
    return false;
  }
}

export function setUnlocked(unlocked) {
  try {
    if (unlocked) sessionStorage.setItem(SESSION_KEY, "unlocked");
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Storage can be unavailable in private browsing modes. The app still
    // works, the unlock just does not survive a reload.
  }
}

export function verifyPassphrase(passphrase) {
  const expected = ownerHash();
  if (!expected || typeof passphrase !== "string") return false;
  const actual = sha256Hex(passphrase).toLowerCase();
  // Compare every character so the time taken does not reveal the prefix.
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) {
    difference |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return difference === 0;
}
