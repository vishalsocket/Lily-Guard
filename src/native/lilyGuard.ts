import {NativeModules} from 'react-native';
import type {NativeLilyGuard} from '../types/callGuard';

export const nativeGuard = NativeModules.LilyGuardManager as
  | NativeLilyGuard
  | undefined;
