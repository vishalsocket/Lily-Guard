import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  AppState,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {Plus, Trash2} from 'lucide-react-native';
import {AddRuleModal} from '../components/AddRuleModal';
import {AppHeader} from '../components/AppHeader';
import {LoadingScreen} from '../components/LoadingScreen';
import {ProtectedCountryCard} from '../components/ProtectedCountryCard';
import {RuleCard} from '../components/RuleCard';
import {ScreeningStatusCard} from '../components/ScreeningStatusCard';
import {INITIAL_CONFIG, RULE_TYPE_META} from '../constants/rules';
import {findCountryByIso} from '../countries';
import {nativeGuard} from '../native/lilyGuard';
import type {RuleType} from '../ruleDraft';
import type {AppConfig, BlockedCallHistory} from '../types/callGuard';
import {cleanDigits} from '../utils/phoneNumber';

const MINIMUM_SPLASH_DURATION_MS = 5000;

export function LilyGuardHomeScreen() {
  const insets = useSafeAreaInsets();
  const [config, setConfig] = useState<AppConfig>(INITIAL_CONFIG);
  const [screeningEnabled, setScreeningEnabled] = useState(false);
  const [openingScreening, setOpeningScreening] = useState(false);
  const [ready, setReady] = useState(false);
  const [showAddRule, setShowAddRule] = useState(false);
  const [history, setHistory] = useState<BlockedCallHistory[]>([]);

  const protectedCountry =
    findCountryByIso(config.protectedCountryIso) ?? {
      iso: config.protectedCountryIso,
      name: config.protectedCountryIso || 'Home country',
      code: config.protectedCountryCode,
    };

  const refreshScreeningStatus = useCallback(async () => {
    if (!nativeGuard || Platform.OS !== 'android') {
      setScreeningEnabled(false);
      return;
    }
    setScreeningEnabled(await nativeGuard.isScreeningEnabled());
  }, []);

  const refreshHistory = useCallback(async () => {
    if (!nativeGuard?.getHistory || Platform.OS !== 'android') {
      setHistory([]);
      return;
    }
    const storedHistory = await nativeGuard.getHistory();
    setHistory(
      storedHistory ? (JSON.parse(storedHistory) as BlockedCallHistory[]) : [],
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const minimumSplashDuration = new Promise<void>(resolve =>
        setTimeout(resolve, MINIMUM_SPLASH_DURATION_MS),
      );

      try {
        if (!nativeGuard || Platform.OS !== 'android') {
          return;
        }

        const [stored, iso] = await Promise.all([
          nativeGuard.getConfig(),
          nativeGuard.getDeviceCountryIso(),
        ]);
        const parsed = stored
          ? (JSON.parse(stored) as AppConfig)
          : INITIAL_CONFIG;
        const deviceCountry = findCountryByIso(iso);
        const next = deviceCountry
          ? {
              ...parsed,
              protectedCountryIso: iso,
              protectedCountryCode: deviceCountry.code,
              rules: parsed.rules.filter(
                rule =>
                  rule.type !== 'country' ||
                  cleanDigits(rule.value) !== deviceCountry.code,
              ),
            }
          : parsed;
        setConfig(next);
        await nativeGuard.saveConfig(JSON.stringify(next));
        await Promise.all([refreshScreeningStatus(), refreshHistory()]);
      } catch {
        Alert.alert('Setup issue', 'Lily Guard settings could not be loaded.');
      } finally {
        await minimumSplashDuration;
        if (!cancelled) {
          setReady(true);
        }
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [refreshHistory, refreshScreeningStatus]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        refreshScreeningStatus();
        refreshHistory();
      }
    });
    return () => subscription.remove();
  }, [refreshHistory, refreshScreeningStatus]);

  const persist = useCallback(async (next: AppConfig) => {
    setConfig(next);
    if (nativeGuard && Platform.OS === 'android') {
      await nativeGuard.saveConfig(JSON.stringify(next));
    }
  }, []);

  const activeCount = useMemo(
    () => config.rules.filter(rule => rule.enabled).length,
    [config.rules],
  );

  async function enableScreening() {
    if (Platform.OS !== 'android') {
      Alert.alert('Android required', 'Live call screening is Android-only.');
      return;
    }
    if (!nativeGuard?.requestScreeningRole) {
      Alert.alert(
        'Reinstall required',
        'The native Lily Guard module is not loaded. Rebuild and reinstall the Android app over USB.',
      );
      return;
    }

    setOpeningScreening(true);
    try {
      const result = await nativeGuard.requestScreeningRole();
      if (result === 'unsupported') {
        Alert.alert(
          'Not supported',
          'Call screening requires Android 10 or newer.',
        );
      } else if (result === 'settings') {
        Alert.alert(
          'Select Lily Guard',
          'Open Caller ID & spam or Call Screening in Default apps, then select Lily Guard.',
        );
      } else if (result === 'granted') {
        await refreshScreeningStatus();
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Android settings could not be opened.';
      Alert.alert('Could not enable screening', message);
    } finally {
      setOpeningScreening(false);
    }
  }

  function toggleRule(id: string) {
    persist({
      ...config,
      rules: config.rules.map(rule =>
        rule.id === id ? {...rule, enabled: !rule.enabled} : rule,
      ),
    });
  }

  function removeRule(id: string) {
    Alert.alert(
      'Delete rule?',
      'Calls matching this rule will be allowed again.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (nativeGuard?.clearHistoryForRule) {
              await nativeGuard.clearHistoryForRule(id);
            }
            setHistory(current => current.filter(entry => entry.ruleId !== id));
            await persist({
              ...config,
              rules: config.rules.filter(rule => rule.id !== id),
            });
          },
        },
      ],
    );
  }

  function clearRuleHistory(ruleId: string) {
    Alert.alert(
      'Delete rule history?',
      'All blocked-call entries for this rule will be permanently deleted.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (nativeGuard?.clearHistoryForRule) {
              await nativeGuard.clearHistoryForRule(ruleId);
            }
            setHistory(current =>
              current.filter(entry => entry.ruleId !== ruleId),
            );
          },
        },
      ],
    );
  }

  function clearAllHistory() {
    Alert.alert(
      'Delete all history?',
      'All blocked-call history will be permanently deleted.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete all',
          style: 'destructive',
          onPress: async () => {
            if (nativeGuard?.clearAllHistory) {
              await nativeGuard.clearAllHistory();
            }
            setHistory([]);
          },
        },
      ],
    );
  }

  function addRule(type: RuleType, value: string, label: string) {
    const digits = cleanDigits(value);
    if (!digits || (type === 'contains' && digits.length < 4)) {
      Alert.alert(
        'Invalid rule',
        type === 'contains' ? 'Enter at least 4 digits.' : 'Enter a number.',
      );
      return false;
    }
    if (type === 'country' && digits === config.protectedCountryCode) {
      Alert.alert(
        'Country protected',
        `${protectedCountry.name} (+${protectedCountry.code}) is your SIM country and cannot be blocked.`,
      );
      return false;
    }
    const duplicate = config.rules.some(
      rule => rule.type === type && cleanDigits(rule.value) === digits,
    );
    if (duplicate) {
      Alert.alert('Already added', 'This rule already exists.');
      return false;
    }
    persist({
      ...config,
      rules: [
        ...config.rules,
        {
          id: `${Date.now()}-${digits}`,
          type,
          value: type === 'country' || type === 'exact' ? `+${digits}` : digits,
          label: label.trim() || RULE_TYPE_META[type].title,
          enabled: true,
        },
      ],
    });
    return true;
  }

  if (!ready) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FlatList
        data={config.rules}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.content,
          {paddingBottom: Math.max(insets.bottom, 16) + 20},
        ]}
        scrollIndicatorInsets={{bottom: insets.bottom}}
        ListHeaderComponent={
          <>
            <AppHeader />
            <ScreeningStatusCard
              screeningEnabled={screeningEnabled}
              openingScreening={openingScreening}
              protectionEnabled={config.protectionEnabled}
              activeCount={activeCount}
              onEnableScreening={enableScreening}
              onProtectionChange={value =>
                persist({...config, protectionEnabled: value})
              }
            />
            <ProtectedCountryCard country={protectedCountry} />
            <View style={styles.sectionHead}>
              <View>
                <Text style={styles.sectionTitle}>Blocking rules</Text>
                <Text style={styles.sectionSubtitle}>
                  {config.rules.length} configured
                </Text>
              </View>
              <View style={styles.sectionActions}>
                {history.length > 0 && (
                  <Pressable
                    testID="clear-all-history"
                    style={styles.clearHistoryButton}
                    onPress={clearAllHistory}>
                    <Trash2 size={15} color="#D13212" />
                  </Pressable>
                )}
                <Pressable
                  testID="add-rule-button"
                  style={styles.addButton}
                  onPress={() => setShowAddRule(true)}>
                  <Plus size={16} color="#0972D3" strokeWidth={2.5} />
                  <Text style={styles.addButtonText}>Add rule</Text>
                </Pressable>
              </View>
            </View>
          </>
        }
        renderItem={({item}) => (
          <RuleCard
            rule={item}
            history={history.filter(entry => entry.ruleId === item.id)}
            onToggle={() => toggleRule(item.id)}
            onRemove={() => removeRule(item.id)}
            onClearHistory={() => clearRuleHistory(item.id)}
          />
        )}
        ListFooterComponent={
          <Text style={styles.footerHint}>
            Tip: long-press a rule to delete it.
          </Text>
        }
      />
      <AddRuleModal
        visible={showAddRule}
        protectedCountryCode={config.protectedCountryCode}
        protectedCountryIso={config.protectedCountryIso}
        onClose={() => setShowAddRule(false)}
        onSave={(type, value, label) => {
          if (addRule(type, value, label)) {
            setShowAddRule(false);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#F2F3F3'},
  content: {padding: 16, paddingBottom: 36},
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {fontSize: 18, color: '#16191F', fontWeight: '700'},
  sectionSubtitle: {color: '#687078', fontSize: 12, marginTop: 1},
  sectionActions: {flexDirection: 'row', alignItems: 'center', gap: 8},
  clearHistoryButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D5DBDB',
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#879596',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  addButtonText: {color: '#0972D3', fontSize: 13, fontWeight: '700'},
  footerHint: {
    textAlign: 'center',
    color: '#687078',
    fontSize: 12,
    marginTop: 10,
  },
});
