import React, {useEffect, useState} from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {ChevronDown, X} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {CountryOption} from '../countries';
import {RULE_TYPE_META} from '../constants/rules';
import {transitionRuleType} from '../ruleDraft';
import type {RuleType} from '../ruleDraft';
import {CountryPicker} from './CountryPicker';

type Props = {
  visible: boolean;
  protectedCountryCode: string;
  protectedCountryIso: string;
  onClose: () => void;
  onSave: (type: RuleType, value: string, label: string) => void;
};

export function AddRuleModal({
  visible,
  protectedCountryCode,
  protectedCountryIso,
  onClose,
  onSave,
}: Props) {
  const insets = useSafeAreaInsets();
  const [type, setType] = useState<RuleType>('starts_with');
  const [value, setValue] = useState('');
  const [label, setLabel] = useState('');
  const [selectedCountry, setSelectedCountry] =
    useState<CountryOption | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  useEffect(() => {
    if (!visible) {
      setType('starts_with');
      setValue('');
      setLabel('');
      setSelectedCountry(null);
      setShowCountryPicker(false);
    }
  }, [visible]);

  function changeType(nextType: RuleType) {
    const next = transitionRuleType(
      type,
      nextType,
      value,
      label,
      selectedCountry?.name,
    );
    setType(next.type);
    setValue(next.value);
    setLabel(next.label);
    if (next.clearSelectedCountry) {
      setSelectedCountry(null);
    }
    setShowCountryPicker(false);
  }

  function selectCountry(country: CountryOption) {
    setSelectedCountry(country);
    setValue(`+${country.code}`);
    if (!label.trim() || label === selectedCountry?.name) {
      setLabel(country.name);
    }
    setShowCountryPicker(false);
  }

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            {paddingBottom: Math.max(insets.bottom, 16) + 12},
          ]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>New blocking rule</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <X size={22} color="#414D5C" />
            </Pressable>
          </View>
          <Text style={styles.fieldLabel}>MATCH TYPE</Text>
          <View style={styles.typeGrid}>
            {(Object.keys(RULE_TYPE_META) as RuleType[]).map(option => (
              <Pressable
                key={option}
                testID={`rule-type-${option}`}
                style={[
                  styles.typeChip,
                  type === option && styles.typeChipActive,
                ]}
                onPress={() => changeType(option)}>
                <Text
                  style={[
                    styles.typeChipText,
                    type === option && styles.typeChipTextActive,
                  ]}>
                  {RULE_TYPE_META[option].title}
                </Text>
              </Pressable>
            ))}
          </View>
          {type === 'country' && (
            <>
              <Text style={styles.fieldLabel}>CHOOSE COUNTRY</Text>
              <Pressable
                testID="country-select"
                style={styles.countrySelect}
                onPress={() => setShowCountryPicker(true)}>
                <View>
                  <Text
                    style={
                      selectedCountry
                        ? styles.countryName
                        : styles.countryPlaceholder
                    }>
                    {selectedCountry?.name ?? 'Select a country'}
                  </Text>
                  {selectedCountry && (
                    <Text style={styles.countryCode}>
                      {selectedCountry.iso} · +{selectedCountry.code}
                    </Text>
                  )}
                </View>
                <ChevronDown size={20} color="#414D5C" />
              </Pressable>
            </>
          )}
          {type !== 'country' && (
            <>
              <Text style={styles.fieldLabel}>NUMBER OR PATTERN</Text>
              <TextInput
                testID="rule-value-input"
                style={styles.input}
                value={value}
                onChangeText={setValue}
                placeholder={RULE_TYPE_META[type].hint}
                placeholderTextColor="#8193A5"
                keyboardType="phone-pad"
              />
            </>
          )}
          {type === 'country' && (
            <Text style={styles.inputHelp}>
              Your home code +{protectedCountryCode} cannot be blocked.
            </Text>
          )}
          <Text style={styles.fieldLabel}>LABEL (OPTIONAL)</Text>
          <TextInput
            testID="rule-label-input"
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder="e.g. Marketing numbers"
            placeholderTextColor="#8193A5"
          />
          <Pressable
            style={styles.saveButton}
            onPress={() => onSave(type, value, label)}>
            <Text style={styles.saveButtonText}>Save blocking rule</Text>
          </Pressable>
        </View>
      </View>
      <CountryPicker
        visible={showCountryPicker}
        protectedCountryIso={protectedCountryIso}
        onClose={() => setShowCountryPicker(false)}
        onSelect={selectCountry}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(22, 25, 31, 0.5)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 9,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#AAB7B8',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {fontSize: 20, color: '#16191F', fontWeight: '700'},
  fieldLabel: {
    fontSize: 10,
    letterSpacing: 1,
    color: '#545B64',
    fontWeight: '800',
    marginBottom: 7,
    marginTop: 10,
  },
  typeGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8},
  typeChip: {
    borderWidth: 1,
    borderColor: '#AAB7B8',
    borderRadius: 4,
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  typeChipActive: {backgroundColor: '#232F3E', borderColor: '#232F3E'},
  typeChipText: {fontSize: 12, color: '#414D5C', fontWeight: '700'},
  typeChipTextActive: {color: '#FFFFFF'},
  countrySelect: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#879596',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countryName: {fontSize: 14, color: '#16191F', fontWeight: '700'},
  countryPlaceholder: {fontSize: 14, color: '#687078'},
  countryCode: {fontSize: 12, color: '#545B64', marginTop: 2},
  input: {
    borderWidth: 1,
    borderColor: '#879596',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    color: '#16191F',
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  inputHelp: {fontSize: 11, color: '#C45500', marginTop: 6},
  saveButton: {
    backgroundColor: '#FF9900',
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: 4,
    marginTop: 22,
    borderWidth: 1,
    borderColor: '#E47911',
  },
  saveButtonText: {color: '#16191F', fontWeight: '700', fontSize: 14},
});
