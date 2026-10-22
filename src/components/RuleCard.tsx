import React, {useState} from 'react';
import {Pressable, StyleSheet, Switch, Text, View} from 'react-native';
import {ChevronDown, ChevronUp, History, Trash2} from 'lucide-react-native';
import {RULE_TYPE_META} from '../constants/rules';
import type {BlockedCallHistory, BlockRule} from '../types/callGuard';
import {RuleTypeIcon} from './RuleTypeIcon';

type Props = {
  rule: BlockRule;
  history: BlockedCallHistory[];
  onToggle: () => void;
  onRemove: () => void;
  onClearHistory: () => void;
};

function formatBlockedAt(timestamp: number) {
  return new Date(timestamp).toLocaleString();
}

export function RuleCard({
  rule,
  history,
  onToggle,
  onRemove,
  onClearHistory,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <Pressable style={styles.ruleRow} onLongPress={onRemove}>
        <View style={styles.symbol}>
          <RuleTypeIcon type={rule.type} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.label}>{rule.label}</Text>
          <Text style={styles.value}>
            {RULE_TYPE_META[rule.type].title} · {rule.value}
          </Text>
        </View>
        <Switch
          value={rule.enabled}
          onValueChange={onToggle}
          trackColor={{false: '#D5DEE7', true: '#2CB67D'}}
          thumbColor="#FFFFFF"
        />
      </Pressable>

      <Pressable
        testID={`rule-history-${rule.id}`}
        style={styles.historyToggle}
        onPress={() => setExpanded(current => !current)}>
        <View style={styles.historyTitle}>
          <History size={15} color="#0972D3" />
          <Text style={styles.historyTitleText}>
            {history.length} blocked {history.length === 1 ? 'call' : 'calls'}
          </Text>
        </View>
        {expanded ? (
          <ChevronUp size={17} color="#687078" />
        ) : (
          <ChevronDown size={17} color="#687078" />
        )}
      </Pressable>

      {expanded && (
        <View style={styles.historyPanel}>
          {history.length === 0 ? (
            <Text style={styles.emptyHistory}>
              No calls have matched this rule yet.
            </Text>
          ) : (
            <>
              {history.map(entry => (
                <View key={entry.id} style={styles.historyRow}>
                  <View style={styles.historyCopy}>
                    <Text style={styles.number}>{entry.number}</Text>
                    <Text style={styles.time}>
                      {formatBlockedAt(entry.timestamp)}
                    </Text>
                  </View>
                  <Text style={styles.blockedLabel}>BLOCKED</Text>
                </View>
              ))}
              <Pressable style={styles.clearButton} onPress={onClearHistory}>
                <Trash2 size={14} color="#D13212" />
                <Text style={styles.clearButtonText}>Delete rule history</Text>
              </Pressable>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D5DBDB',
    overflow: 'hidden',
  },
  ruleRow: {flexDirection: 'row', alignItems: 'center', padding: 14},
  symbol: {
    width: 38,
    height: 38,
    borderRadius: 4,
    backgroundColor: '#F2F3F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {flex: 1, marginLeft: 12},
  label: {color: '#16191F', fontSize: 14, fontWeight: '700'},
  value: {color: '#687078', fontSize: 12, marginTop: 2},
  historyToggle: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: '#EAEDED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyTitle: {flexDirection: 'row', alignItems: 'center', gap: 7},
  historyTitleText: {fontSize: 12, color: '#0972D3', fontWeight: '700'},
  historyPanel: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    backgroundColor: '#F8F9F9',
  },
  emptyHistory: {fontSize: 12, color: '#687078', paddingVertical: 12},
  historyRow: {
    minHeight: 51,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEDED',
  },
  historyCopy: {flex: 1},
  number: {fontSize: 13, color: '#16191F', fontWeight: '700'},
  time: {fontSize: 11, color: '#687078', marginTop: 2},
  blockedLabel: {
    fontSize: 9,
    color: '#D13212',
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 12,
  },
  clearButtonText: {fontSize: 12, color: '#D13212', fontWeight: '700'},
});
