export type RuleType =
  | 'starts_with'
  | 'ends_with'
  | 'contains'
  | 'exact'
  | 'country';

export type RuleDraftTransition = {
  type: RuleType;
  value: string;
  label: string;
  clearSelectedCountry: boolean;
};

export function transitionRuleType(

  currentType: RuleType,
  nextType: RuleType,
  value: string,
  label: string,
  selectedCountryName?: string,

): RuleDraftTransition {
  if (currentType === nextType) {
    return { type: currentType, value, label, clearSelectedCountry: false };
  }

  return {
    type: nextType,
    value: '',
    label: label === selectedCountryName ? '' : label,
    clearSelectedCountry: true,
  };
}
