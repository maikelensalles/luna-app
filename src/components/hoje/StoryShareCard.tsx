import { Image, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../constants/theme';

type StoryShareCardProps = {
  quote: string;
  category: string;
};

export function StoryShareCard({ quote, category }: StoryShareCardProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/images/luna-icon.png')}
        style={styles.icon}
        resizeMode="contain"
      />
      <View style={styles.quoteWrapper}>
        <Text style={styles.quote}>“{quote}”</Text>
        <Text style={styles.category}>{category}</Text>
      </View>
      <Text style={styles.footer}>via Luna</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 375,
    height: 667,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl * 1.5,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    width: 120,
    height: 120,
  },
  quoteWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quote: {
    ...theme.typography.heading,
    fontStyle: 'italic',
    fontSize: 26,
    lineHeight: 36,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  category: {
    ...theme.typography.subheading,
    color: theme.colors.accent,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  footer: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});
