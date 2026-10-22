import type {RuleType} from '../ruleDraft';

export type BlockRule = {
  id: string;
  type: RuleType;
  value: string;
  label: string;
  enabled: boolean;
};

export type AppConfig = {
  protectionEnabled: boolean;
  protectedCountryCode: string;
  protectedCountryIso: string;
  rules: BlockRule[];
};

export type BlockedCallHistory = {
  id: string;
  ruleId: string;
  number: string;
  timestamp: number;
};

export type ScreeningRoleResult =
  | 'granted'
  | 'opened'
  | 'settings'
  | 'unsupported';

export type NativeLilyGuard = {
  getConfig(): Promise<string>;
  saveConfig(config: string): Promise<boolean>;
  getHistory?(): Promise<string>;
  clearHistoryForRule?(ruleId: string): Promise<boolean>;
  clearAllHistory?(): Promise<boolean>;
  getDeviceCountryIso(): Promise<string>;
  isScreeningEnabled(): Promise<boolean>;
  requestScreeningRole(): Promise<ScreeningRoleResult>;
};
