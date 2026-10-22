import React from 'react';
import {Pressable, StyleSheet, Switch, Text, View} from 'react-native';
import {ShieldAlert, ShieldCheck} from 'lucide-react-native';

type Props = {
  screeningEnabled: boolean;
  openingScreening: boolean;
  protectionEnabled: boolean;
  activeCount: number;
  onEnableScreening: () => void;
  onProtectionChange: (enabled: boolean) => void;
};

export function ScreeningStatusCard({
  screeningEnabled,
  openingScreening,
  protectionEnabled,
  activeCount,
  onEnableScreening,
  onProtectionChange,
}: Props) {
  return (
    <View style={[styles.card, screeningEnabled && styles.cardOn]}>
      <View style={styles.statusTop}>
        {screeningEnabled ? (
          <ShieldCheck size={18} color="#1D8102" />
        ) : (
          <ShieldAlert size={18} color="#C45500" />
        )}
        <Text style={styles.statusLabel}>
          {screeningEnabled ? 'SYSTEM PROTECTION ACTIVE' : 'ACTION REQUIRED'}
        </Text>
      </View>
      <Text style={styles.title}>
        {screeningEnabled ? 'Calls are being screened' : 'Enable call screening'}
      </Text>
      <Text style={styles.body}>
        {screeningEnabled
          ? `${activeCount} active ${
              activeCount === 1 ? 'rule' : 'rules'
            } checked before your phone rings.`
          : 'Allow Lily Guard in Android settings. Your normal Phone app stays unchanged.'}
      </Text>
      {!screeningEnabled && (
        <Pressable
          disabled={openingScreening}
          style={[styles.primaryButton, openingScreening && styles.disabled]}
          onPress={onEnableScreening}>
          <Text style={styles.primaryButtonText}>
            {openingScreening
              ? 'Opening Android settings…'
              : 'Enable in Android'}
          </Text>
        </Pressable>
      )}
      {screeningEnabled && (
        <View style={styles.masterRow}>
          <Text style={styles.masterText}>Blocking enabled</Text>
          <Switch
            value={protectionEnabled}
            onValueChange={onProtectionChange}
            trackColor={{false: '#8CA0B3', true: '#43C59E'}}
            thumbColor="#FFFFFF"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: '#D5DBDB',
    borderLeftColor: '#FF9900',
  },
  cardOn: {borderLeftColor: '#1D8102'},
  statusTop: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  statusLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    color: '#545B64',
    fontWeight: '800',
    marginLeft: 7,
  },
  title: {color: '#16191F', fontSize: 21, fontWeight: '700'},
  body: {color: '#414D5C', fontSize: 14, lineHeight: 20, marginTop: 6},
  primaryButton: {
    backgroundColor: '#FF9900',
    borderRadius: 4,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#E47911',
  },
  primaryButtonText: {color: '#16191F', fontSize: 14, fontWeight: '700'},
  disabled: {opacity: 0.65},
  masterRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EAEDED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  masterText: {color: '#16191F', fontSize: 14, fontWeight: '700'},
});
