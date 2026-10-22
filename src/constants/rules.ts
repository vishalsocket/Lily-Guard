import type {RuleType} from '../ruleDraft';
import type {AppConfig} from '../types/callGuard';

export const RULE_TYPE_META: Record<
  RuleType,
  {title: string; hint: string}
> = {
  starts_with: {title: 'Starts with', hint: 'Example: 140'},
  ends_with: {title: 'Ends with', hint: 'Example: 786'},
  contains: {title: 'Contains', hint: 'Minimum 4 digits'},
  exact: {title: 'Exact number', hint: 'Example: +919876543210'},
  country: {title: 'Country code', hint: 'Example: +44'},
};

export const INITIAL_CONFIG: AppConfig = {
  protectionEnabled: true,
  protectedCountryCode: '91',
  protectedCountryIso: 'IN',
  rules: [
    {
      id: 'default-140',
      type: 'starts_with',
      value: '140',
      label: 'Promotional calls',
      enabled: true,
    },
  ],
};
