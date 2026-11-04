import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { createFinanceApiClient } from '@finance/api-client';
import { HealthCheckResponse } from '@finance/types';
import { calculateCompoundInterest, calculateLoanEMI, formatCurrency } from '@finance/utils';
import { financeColors } from '@finance/ui';

// In React Native development, localhost on Android emulator is 10.0.2.2 or physical machine IP
const apiClient = createFinanceApiClient({
  baseUrl: 'http://localhost:5000'
});

export default function App() {
  const [healthStatus, setHealthStatus] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [connectionMessage, setConnectionMessage] = useState<string>('Testing API connectivity...');

  const compoundExample = calculateCompoundInterest(20000, 0.08, 10, 12, 6000);
  const emiExample = calculateLoanEMI(350000, 0.065, 360);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await apiClient.health.check();
      setHealthStatus(res.data);
      setConnectionMessage('Backend API Connected');
    } catch {
      setConnectionMessage('API offline or host unreachable from simulator');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>WealthFlow Mobile</Text>
          <Text style={styles.subtitle}>All-in-One Wealth Platform • Expo React Native</Text>
        </View>

        {/* Backend Connectivity Status */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Technical Foundation Status</Text>
          <View style={styles.statusRow}>
            <View style={[styles.badge, { backgroundColor: healthStatus ? '#064E3B' : '#78350F' }]}>
              <Text style={{ color: healthStatus ? '#6EE7B7' : '#FDE68A', fontSize: 12, fontWeight: '600' }}>
                {loading ? 'CHECKING...' : connectionMessage}
              </Text>
            </View>
          </View>
          <Text style={styles.mutedText}>Target Base URL: http://localhost:5000/api/v1</Text>
          <TouchableOpacity style={styles.button} onPress={checkHealth}>
            <Text style={styles.buttonText}>Ping Health Check</Text>
          </TouchableOpacity>
        </View>

        {/* Financial Calculation Engine Demonstration */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Shared Math Engine (@finance/utils)</Text>
          
          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>10-Year Compound Projection ($20k init + $500/mo @ 8%)</Text>
            <Text style={[styles.metricValue, { color: financeColors.financial.income }]}>
              {formatCurrency(compoundExample.futureValue)}
            </Text>
            <Text style={styles.mutedText}>
              Earned Interest: {formatCurrency(compoundExample.totalInterestEarned)}
            </Text>
          </View>

          <View style={[styles.metricBlock, { borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 12, marginTop: 12 }]}>
            <Text style={styles.metricLabel}>30-Yr Mortgage EMI ($350k @ 6.5%)</Text>
            <Text style={[styles.metricValue, { color: financeColors.financial.asset }]}>
              {formatCurrency(emiExample.monthlyEMI)} / mo
            </Text>
            <Text style={styles.mutedText}>
              Total Repayment: {formatCurrency(emiExample.totalPayment)}
            </Text>
          </View>
        </View>

        {/* Registered Subsystems */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Mobile Domain Architecture</Text>
          <Text style={styles.mutedText}>
            Cross-platform TypeScript models & schemas bound for:
          </Text>
          <Text style={styles.moduleItem}>• Accounts & Banking (Depository, Credit, Loans)</Text>
          <Text style={styles.moduleItem}>• Investments (Stocks, ETFs, Crypto, Vaulted Metals)</Text>
          <Text style={styles.moduleItem}>• Double-Entry Cash Flow & Amortization</Text>
          <Text style={styles.moduleItem}>• AI Wealth Advisory & Net Worth Analytics</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19'
  },
  scrollContent: {
    padding: 20
  },
  header: {
    marginBottom: 24,
    paddingTop: 12
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#F8FAFC'
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#334155'
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 10
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: 8
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6
  },
  mutedText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 14
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14
  },
  metricBlock: {
    marginVertical: 4
  },
  metricLabel: {
    fontSize: 13,
    color: '#CBD5E1',
    marginBottom: 4
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700'
  },
  moduleItem: {
    fontSize: 13,
    color: '#E2E8F0',
    marginTop: 8
  }
});

