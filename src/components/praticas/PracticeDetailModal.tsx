import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { LunaButton } from '../ui/LunaButton';
import { theme } from '../../constants/theme';
import { getEmbedUrl } from '../../utils/videoEmbed';
import type { PracticeItem } from '../../types/database';
import { Platform } from 'react-native';

type PracticeDetailModalProps = {
  practice: PracticeItem | null;
  isInToday: boolean;
  onClose: () => void;
  onAddPractice: (practiceId: string) => Promise<unknown>;
  onRemovePractice: (practiceId: string) => Promise<unknown>;
};

export function PracticeDetailModal({
  practice,
  isInToday,
  onClose,
  onAddPractice,
  onRemovePractice,
}: PracticeDetailModalProps) {
  const router = useRouter();

  if (!practice) {
    return null;
  }

  const embedUrl = practice.videoUrl ? getEmbedUrl(practice.videoUrl) : null;

  console.log('DEBUG practice.videoUrl:', practice?.videoUrl);
  console.log('DEBUG embedUrl:', embedUrl);

  async function handleAdd() {
    await onAddPractice(practice!.id);
    onClose();
    router.push('/(tabs)/jornada');
  }

  async function handleRemove() {
    await onRemovePractice(practice!.id);
    onClose();
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>{practice.title}</Text>
          <Text style={styles.meta}>
            {practice.category} · {practice.durationMinutes} min
          </Text>
          <Text style={styles.description}>
            {practice.description ?? `Uma prática de ${practice.category} para o seu dia.`}
          </Text>
          {embedUrl && (
            <View style={{ width: '100%', height: 220, marginTop: 16, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' }}>
              {Platform.OS === 'web' ? (
                <iframe
                  src={embedUrl}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <WebView
                source={{
                  html: `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                        <style>
                          body { margin: 0; padding: 0; background-color: #000; overflow: hidden; }
                          iframe { width: 100vw; height: 100vh; border: none; }
                        </style>
                      </head>
                      <body>
                        <iframe 
                          src="${embedUrl}&origin=https://luna-app.com" 
                          allow="autoplay; fullscreen; encrypted-media" 
                          allowfullscreen>
                        </iframe>
                      </body>
                    </html>
                  `,
                  baseUrl: 'https://luna-app.com' // <-- Enganamos o YouTube com um domínio "terceiro"
                }}
                style={{ flex: 1, backgroundColor: '#000' }}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                scrollEnabled={false}
                bounces={false}
              />
              )}
            </View>
          )}
          {isInToday ? (
            <LunaButton label="Remover da Jornada" variant="ghost" onPress={handleRemove} />
          ) : (
            <LunaButton label="Adicionar à Jornada" onPress={handleAdd} />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: theme.colors.backgroundElevated,
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.accentBorder,
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.subheading,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  meta: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.lg,
  },
});
