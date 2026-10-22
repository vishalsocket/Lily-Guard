import React from 'react';
import {Globe2, Hash, ListEnd, ListStart, ScanSearch} from 'lucide-react-native';
import type {RuleType} from '../ruleDraft';

export function RuleTypeIcon({type}: {type: RuleType}) {
  const iconProps = {size: 20, color: '#414D5C', strokeWidth: 2};

  switch (type) {
    case 'starts_with':
      return <ListStart {...iconProps} />;
    case 'ends_with':
      return <ListEnd {...iconProps} />;
    case 'contains':
      return <ScanSearch {...iconProps} />;
    case 'country':
      return <Globe2 {...iconProps} />;
    default:
      return <Hash {...iconProps} />;
  }
}
