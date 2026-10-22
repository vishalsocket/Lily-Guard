import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {LilyGuardHomeScreen} from './src/screens/LilyGuardHomeScreen';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <LilyGuardHomeScreen />
    </SafeAreaProvider>
  );
}

export default App;
