import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button as PaperButton } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import ScreenContainer from '../../components/common/ScreenContainer';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuthStore } from '@/stores/auth.store';
import { COLORS, RADIUS, SPACING } from '@/theme';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginScreen: React.FC = () => {
  const { login, isLoading, error: authError, setError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Clear errors when screen is unmounted
  React.useEffect(() => {
    return () => {
      setError(null);
    };
  }, [setError]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({
        email: data.email,
        password: data.password,
      });
    } catch {
      // Errors are caught and handled inside useAuthStore
    }
  };

  const fillDemo = (role: 'doctor' | 'patient') => {
    setValue('email', role === 'doctor' ? 'doctor1@example.com' : 'patient1@example.com');
    setValue('password', 'password123');
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <TextInput.Icon icon="heart-pulse" color="#ffffff" size={32} />
            </View>
            <Text style={styles.title} variant="headlineMedium">
              CareConnect
            </Text>
            <Text style={styles.tagline} variant="bodyMedium">
              Seamless doctor consultations & scheduling at your fingertips.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle} variant="titleLarge">
              Welcome Back
            </Text>

            {authError && (
              <Text style={styles.generalError} variant="bodyMedium">
                {authError}
              </Text>
            )}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.fieldContainer}>
                  <Input
                    label="Email Address"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.email}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    disabled={isLoading}
                    left={<TextInput.Icon icon="email-outline" color="#64748b" />}
                  />
                  {errors.email && (
                    <Text style={styles.errorText} variant="bodySmall">
                      {errors.email.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.fieldContainer}>
                  <Input
                    label="Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.password}
                    secureTextEntry={!showPassword}
                    disabled={isLoading}
                    left={<TextInput.Icon icon="lock-outline" color="#64748b" />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        color="#64748b"
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                  />
                  {errors.password && (
                    <Text style={styles.errorText} variant="bodySmall">
                      {errors.password.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Button
              style={styles.button}
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>

          <View style={styles.demoSection}>
            <Text style={styles.demoTitle} variant="bodySmall">
              Quick Sign In for Testing:
            </Text>
            <View style={styles.demoButtons}>
              <PaperButton
                mode="outlined"
                onPress={() => fillDemo('doctor')}
                style={styles.demoButton}
                labelStyle={styles.demoButtonLabel}
              >
                Doctor Demo
              </PaperButton>
              <PaperButton
                mode="outlined"
                onPress={() => fillDemo('patient')}
                style={styles.demoButton}
                labelStyle={styles.demoButtonLabel}
              >
                Patient Demo
              </PaperButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    // Accent shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  tagline: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.large,
    padding: SPACING.lg,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  formTitle: {
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  errorText: {
    color: COLORS.error,
    marginTop: 4,
    marginLeft: 4,
  },
  generalError: {
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#fee2e2',
    borderRadius: RADIUS.medium,
    fontWeight: '500',
  },
  demoSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  demoTitle: {
    color: '#64748b',
    marginBottom: 12,
    fontWeight: '500',
  },
  demoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  demoButton: {
    borderColor: '#cbd5e1',
    borderRadius: RADIUS.medium,
  },
  demoButtonLabel: {
    color: '#334155',
    fontWeight: '600',
  },
});

export default LoginScreen;
