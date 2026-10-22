import React from 'react';
import {Image, StyleSheet} from 'react-native';

const splashArtwork = require('../../assets/images/lily-guard-magical-call-shield.png');

export function LoadingScreen() {
  return (
    <Image
      accessibilityLabel="Lily Guard magical call shield"
      source={splashArtwork}
      style={styles.container}
      resizeMode="stretch"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#02070F',
  },
});
