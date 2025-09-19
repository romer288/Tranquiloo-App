import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';

const AnalyticsScreen: React.FC = () => {
  const mockData = {
    currentWeek: {
      anxietyLevel: 4.2,
      sessionsCompleted: 5,
      goalsProgress: 78.5,
    },
    recentTrends: [
      { date: 'Mon', level: 3 },
      { date: 'Tue', level: 4 },
      { date: 'Wed', level: 2 },
      { date: 'Thu', level: 5 },
      { date: 'Fri', level: 3 },
      { date: 'Sat', level: 2 },
      { date: 'Sun', level: 4 },
    ],
  };

  const StatCard = ({ title, value, subtitle }: { title: string; value: string; subtitle: string }) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Progress</Text>
        <Text style={styles.headerSubtitle}>Track your mental health journey</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Average Anxiety Level"
          value={mockData.currentWeek.anxietyLevel.toFixed(1)}
          subtitle="This week (1-10 scale)"
        />
        <StatCard
          title="Sessions Completed"
          value={mockData.currentWeek.sessionsCompleted.toString()}
          subtitle="This week"
        />
        <StatCard
          title="Goals Progress"
          value={`${mockData.currentWeek.goalsProgress.toFixed(1)}%`}
          subtitle="Overall completion"
        />
      </View>

      <View style={styles.trendsSection}>
        <Text style={styles.sectionTitle}>Weekly Anxiety Trends</Text>
        <View style={styles.chartContainer}>
          <View style={styles.chartPlaceholder}>
            {mockData.recentTrends.map((day, index) => (
              <View key={index} style={styles.chartDay}>
                <View
                  style={[
                    styles.chartBar,
                    { height: (day.level / 10) * 100 },
                    { backgroundColor: day.level > 6 ? '#ef4444' : day.level > 4 ? '#f59e0b' : '#10b981' },
                  ]}
                />
                <Text style={styles.chartDayLabel}>{day.date}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.insightsSection}>
        <Text style={styles.sectionTitle}>Insights</Text>
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>💪 Great Progress!</Text>
          <Text style={styles.insightText}>
            Your anxiety levels have decreased by 20% compared to last week. Keep up the good work with your daily check-ins!
          </Text>
        </View>
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>🎯 Goal Achievement</Text>
          <Text style={styles.insightText}>
            You're making excellent progress on your meditation goal. Just 2 more sessions to reach your weekly target.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  trendsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartPlaceholder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartDay: {
    alignItems: 'center',
    width: 32,
  },
  chartBar: {
    width: 20,
    borderRadius: 4,
    minHeight: 10,
  },
  chartDayLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  insightsSection: {
    padding: 16,
  },
  insightCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

export default AnalyticsScreen;