import React, {useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Search, X} from 'lucide-react-native';
import {COUNTRIES} from '../countries';
import type {CountryOption} from '../countries';

type Props = {
  visible: boolean;
  protectedCountryIso: string;
  onClose: () => void;
  onSelect: (country: CountryOption) => void;
};

export function CountryPicker({
  visible,
  protectedCountryIso,
  onClose,
  onSelect,
}: Props) {
  const [query, setQuery] = useState('');
  const filteredCountries = useMemo(() => {
    const needle = query.trim().toLowerCase().replace('+', '');
    if (!needle) {
      return COUNTRIES;
    }
    return COUNTRIES.filter(
      country =>
        country.name.toLowerCase().includes(needle) ||
        country.iso.toLowerCase().includes(needle) ||
        country.code.includes(needle),
    );
  }, [query]);

  useEffect(() => {
    if (!visible) {
      setQuery('');
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="fade"
      onRequestClose={onClose}>
      <SafeAreaView
        style={styles.backdrop}
        edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.popup}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Choose country</Text>
              <Text style={styles.subtitle}>
                {COUNTRIES.length} calling-code options
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={12}>
              <X size={22} color="#414D5C" />
            </Pressable>
          </View>
          <View style={styles.searchBox}>
            <Search size={18} color="#687078" />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Search country, ISO or +code"
              placeholderTextColor="#687078"
              style={styles.searchInput}
            />
          </View>
          <FlatList
            data={filteredCountries}
            keyExtractor={item => `${item.iso}-${item.code}`}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.countryList}
            renderItem={({item}) => {
              const isProtected = item.iso === protectedCountryIso;
              return (
                <Pressable
                  testID={`country-${item.iso}-${item.code}`}
                  disabled={isProtected}
                  onPress={() => onSelect(item)}
                  style={[
                    styles.countryRow,
                    isProtected && styles.countryRowDisabled,
                  ]}>
                  <View style={styles.isoBadge}>
                    <Text style={styles.isoText}>{item.iso}</Text>
                  </View>
                  <View style={styles.countryCopy}>
                    <Text
                      style={[
                        styles.countryName,
                        isProtected && styles.disabledText,
                      ]}>
                      {item.name}
                    </Text>
                    {isProtected && (
                      <Text style={styles.protectedOption}>
                        SIM country · cannot block
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.callingCode,
                      isProtected && styles.disabledText,
                    ]}>
                    +{item.code}
                  </Text>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.empty}>No country found.</Text>
            }
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 18,
    backgroundColor: 'rgba(22, 25, 31, 0.58)',
  },
  popup: {
    height: '82%',
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: '#F2F3F3',
    borderRadius: 8,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#AAB7B8',
    alignSelf: 'center',
    marginTop: 9,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {fontSize: 20, color: '#16191F', fontWeight: '700'},
  subtitle: {fontSize: 12, color: '#687078', marginTop: 2},
  searchBox: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#879596',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 9,
    paddingVertical: 11,
    color: '#16191F',
    fontSize: 14,
  },
  countryList: {paddingHorizontal: 16, paddingBottom: 24},
  countryRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingHorizontal: 12,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: '#D5DBDB',
  },
  countryRowDisabled: {backgroundColor: '#EAEDED'},
  isoBadge: {
    width: 40,
    height: 30,
    borderRadius: 3,
    backgroundColor: '#EAF3FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  isoText: {fontSize: 12, color: '#0972D3', fontWeight: '800'},
  countryCopy: {flex: 1, marginLeft: 12},
  countryName: {fontSize: 14, color: '#16191F', fontWeight: '700'},
  callingCode: {fontSize: 14, color: '#0972D3', fontWeight: '700'},
  protectedOption: {fontSize: 10, color: '#C45500', marginTop: 2},
  disabledText: {color: '#879596'},
  empty: {textAlign: 'center', color: '#687078', paddingTop: 36},
});
