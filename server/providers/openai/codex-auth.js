// Codex/ChatGPT OAuth integration is disabled in this untrusted fork.
// This module must never read host auth files or launch the Codex CLI.
export function codexAuthPath() { return null; }
export function preferCodexOAuth() { return false; }
export function readCodexOAuthAccessToken() { throw Object.assign(new Error('Codex OAuth is disabled'), { code: 'CODEX_OAUTH_DISABLED' }); }
export function resolveCodexExecutable() { return null; }
export function codexLoginEnvironment() { return {}; }
export function startCodexChatGptLogin() { throw Object.assign(new Error('Codex login is disabled'), { code: 'CODEX_OAUTH_DISABLED' }); }
export function createCodexOAuthLogin() { return { status: () => ({ available: false, error: 'Codex OAuth is disabled' }), start: async () => ({ available: false, loginFailed: true, error: 'Codex OAuth is disabled' }), dispose: () => {} }; }
