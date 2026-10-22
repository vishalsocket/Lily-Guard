import React from 'react';
import {Image, StyleSheet} from 'react-native';

const logo = require('../../assets/images/lily-guard-golden-shield-logo.png');

type Props = {
  size: number;
};

export function BrandLogo({size}: Props) {
  return (
    <Image
      accessibilityLabel="Lily Guard logo"
      source={logo}
      style={[styles.logo, {width: size, height: size}]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {backgroundColor: '#000000'},
});
