#!/usr/bin/env node
import { realpathSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyPinokioEnvironment } from './pinokio-environment.mjs';
import { formatSetupReport, inspectSetup, npmProcessSpec } from './setup-doctor.mjs';

// Keep secrets out of npm and its install scripts, even when inherited from
// the parent Pinokio process. This does not sandbox dependency code: install
// only in an isolated environment without access to private host files.
const INSTALL_ENV_FIELDS = [
  'PATH', 'Path', 'HOME', 'TMPDIR', 'TMP', 'TEMP',
  'SystemRoot', 'WINDIR', 'ComSpec', 'PATHEXT',
  'APPDATA', 'LOCALAPPDATA', 'USERPROFILE',
];

export function sanitizedInstallEnvironment(environment = process.env) {
  const safe = { PUPPETEER_SKIP_DOWNLOAD: '1' };
  for (const field of INSTALL_ENV_FIELDS) {
    if (typeof environment[field] === 'string') safe[field] = environment[field];
  }
  return safe;
}

const MODULE_PATH = fileURLToPath(import.meta.url);
const ROOT = realpathSync(path.resolve(path.dirname(MODULE_PATH), '..'));
const READY_FILE = path.join(ROOT, 'pinokio', '.installed');

export function runChecked(command, args, { shell = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    env: sanitizedInstallEnvironment(),
    shell,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

export function installPinokioDependencies() {
  throw new Error('Dependency installation is disabled while this fork is quarantined. No package manager may run.');
  rmSync(READY_FILE, { force: true });
  const npm = npmProcessSpec();
  runChecked(npm.command, ['ci'], { shell: npm.shell });

  // Import app credentials only after npm and dependency lifecycle scripts exit.
  applyPinokioEnvironment();

  // Pinokio starts Vite directly and loads only its ENVIRONMENT file plus the
  // normal dotenv ladder. Unlike dev-fresh.sh, it does not import macOS
  // Keychain items, so its install report must describe that exact runtime.
  const report = inspectSetup({
    includeKeychain: false,
    // The raw app ENVIRONMENT file was applied above. Even an empty field now
    // shadows Vite's dotenv ladder, so diagnosis must stop there instead of
    // claiming a dotenv-only value will reach the launched app.
    authoritativeEnvironment: true,
  });
  console.log(`\n${formatSetupReport(report, {
    readyMessage: 'Ready. Return to Pinokio and choose Start.',
  })}\n`);
  if (!report.ready) process.exit(1);

  writeFileSync(READY_FILE, `${new Date().toISOString()}\n`, { mode: 0o600 });
  console.log('[Pinokio] Installation ready.');
}

export function isDirectInvocation(
  invokedPath = process.argv[1],
  modulePath = MODULE_PATH,
) {
  if (typeof invokedPath !== 'string' || invokedPath.length === 0) return false;
  if (typeof modulePath !== 'string' || modulePath.length === 0) return false;
  try {
    return realpathSync(path.resolve(invokedPath)) === realpathSync(path.resolve(modulePath));
  } catch {
    return path.resolve(invokedPath) === path.resolve(modulePath);
  }
}

if (isDirectInvocation()) {
  installPinokioDependencies();
}
