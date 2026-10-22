import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {BrandLogo} from './BrandLogo';

export function AppHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.brandMark}>
        <BrandLogo size={68} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>LILY GUARD</Text>
        <Text style={styles.title}>Quiet phone. Clear mind.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  brandMark: {
    width: 68,
    height: 68,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {marginLeft: 12, flex: 1},
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.8,
    color: '#687078',
    fontWeight: '800',
  },
  title: {fontSize: 22, color: '#16191F', fontWeight: '700', marginTop: 1},
});
