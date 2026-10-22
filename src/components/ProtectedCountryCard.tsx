import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {LockKeyhole} from 'lucide-react-native';
import type {CountryOption} from '../countries';

export function ProtectedCountryCard({country}: {country: CountryOption}) {
  return (
    <View style={styles.card}>
      <View style={styles.lockBadge}>
        <LockKeyhole size={19} color="#0972D3" />
      </View>
      <View style={styles.copy}>
        <Text style={styles.label}>PROTECTED HOME COUNTRY</Text>
        <Text style={styles.title}>
          {country.name} +{country.code}
        </Text>
        <Text style={styles.body}>
          Country-wide blocking is disabled for your SIM country.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#AAB7B8',
  },
  lockBadge: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: '#EAF3FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {marginLeft: 12, flex: 1},
  label: {
    color: '#0972D3',
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '800',
  },
  title: {color: '#16191F', fontSize: 16, fontWeight: '700', marginTop: 2},
  body: {color: '#545B64', fontSize: 12, lineHeight: 17, marginTop: 3},
});
