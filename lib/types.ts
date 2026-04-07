// lib/types.ts

export type HostName = "claude" | "codex" | "cursor" | "windsurf" | "kiro" | "generic";

export interface HostPaths {
  name: HostName;
  skillsDir: string;
  settingsFile: string;
  configDir: string;
}

export interface ModulePermissions {
  tools: string[];
  bash_commands: string[];
  file_access: { read?: string; write?: string }[];
  dangerous: string[];
}

export interface ModuleConfig {
  permissions: ModulePermissions;
  self_test?: {
    command: string;
    expected: string;
    timeout: string;
  };
  [key: string]: unknown;
}

export interface UpdateConfig {
  auto_upgrade?: boolean;
  check_interval?: string;
  channel?: "stable" | "beta" | "dev";
  notify?: boolean;
}

export interface YellyConfig {
  [module: string]: Record<string, unknown> | UpdateConfig | undefined;
  update?: UpdateConfig;
}

export interface RouteMatch {
  module: string;
  confidence: number;
  keywords: string[];
}

export interface SessionState {
  session_id: string;
  started_at: string;
  mega_skill: string;
  modules_loaded: string[];
  current_step: string;
  permissions_granted: {
    safe: boolean;
    dangerous: string[];
  };
  actions_taken: { step: string; status: "success" | "fail"; error?: string }[];
  rollback_points: { file: string; git_ref: string }[];
}

export interface TemplateContext {
  host: HostName;
  modulesRoot: string;
  binRoot: string;
  version: string;
}

export interface Resolver {
  placeholder: string;
  resolve: (ctx: TemplateContext) => string;
}
