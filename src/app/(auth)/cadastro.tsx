import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { LunaTextInput } from '../../components/ui/LunaTextInput';
import { LunaButton } from '../../components/ui/LunaButton';
import { useSession } from '../../contexts/SessionContext';
import { theme } from '../../constants/theme';

export default function CadastroScreen() {
  const { signUp } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  async function handleSubmit() {
    setErrorMessage(null);
    setInfoMessage(null);
    setIsSubmitting(true);
    try {
      const { error } = await signUp(email, password);
      if (error) {
        setErrorMessage(error);
      } else {
        setInfoMessage('Cadastro realizado! Verifique seu email para confirmar a conta.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenContainer style={styles.content}>
      <Text style={styles.heading}>Crie sua conta</Text>
      <Text style={styles.subheading}>Comece sua jornada com o Luna</Text>

      <View style={styles.form}>
        <LunaTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="seu@email.com"
        />
        <LunaTextInput
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="mínimo 6 caracteres"
        />

        {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
        {infoMessage && <Text style={styles.info}>{infoMessage}</Text>}

        <LunaButton label="Cadastrar" onPress={handleSubmit} isLoading={isSubmitting} />
      </View>

      <Link href="/(auth)/login" style={styles.link}>
        <Text style={styles.linkText}>Já tem conta? Entrar</Text>
      </Link>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  heading: {
    ...theme.typography.heading,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subheading: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  form: {
    marginBottom: theme.spacing.lg,
  },
  error: {
    color: theme.colors.danger,
    marginBottom: theme.spacing.md,
  },
  info: {
    color: theme.colors.gold,
    marginBottom: theme.spacing.md,
  },
  link: {
    alignSelf: 'center',
  },
  linkText: {
    color: theme.colors.gold,
    fontSize: theme.typography.caption.fontSize,
  },
});
