/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import {transitionRuleType} from '../src/ruleDraft';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});

describe('rule type state transitions', () => {
  test('clears selected country code and automatic label on type change', () => {
    expect(
      transitionRuleType(
        'country',
        'contains',
        '+44',
        'United Kingdom',
        'United Kingdom',
      ),
    ).toEqual({
      type: 'contains',
      value: '',
      label: '',
      clearSelectedCountry: true,
    });
  });

  test('keeps a custom label but clears incompatible value', () => {
    expect(
      transitionRuleType('country', 'exact', '+44', 'My overseas rule', 'United Kingdom'),
    ).toEqual({
      type: 'exact',
      value: '',
      label: 'My overseas rule',
      clearSelectedCountry: true,
    });
  });

  test('does not reset state when the same type is selected again', () => {
    expect(transitionRuleType('country', 'country', '+44', 'United Kingdom')).toEqual({
      type: 'country',
      value: '+44',
      label: 'United Kingdom',
      clearSelectedCountry: false,
    });
  });
});
