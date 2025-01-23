import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { API_URL } from "~/lib/constants";
import { SafeAreaView } from "react-native-safe-area-context";

type Feedback = {
  minLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumbers: boolean;
  hasSpecialChar: boolean;
  hasPassed: boolean;
};

function checkPasswordStrength(password: string) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    minLength: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
    hasPassed:
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar,
  };
}

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const router = useRouter();
  const [errorText, setErrorText] = useState("");

  async function handleRegister() {
    setErrorText("");
    const res = checkPasswordStrength(password);
    if (!res.hasPassed) {
      setFeedback(res);
      return;
    }

    setIsFetching(true);
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });
      if (res.ok) {
        router.push("/auth/login");
      } else {
        setErrorText("Something went wrong");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetching(false);
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#f7f7f7",
        paddingTop: 100,
        paddingHorizontal: 24,
      }}
    >
      <Stack.Screen
        options={{
          headerTitle: "Register",
        }}
      />
      <View style={styles.container}>
        <Text style={styles.title}>Register</Text>
        <TextInput
          placeholder="Username"
          placeholderTextColor="#a1a1a1"
          value={username}
          onChangeText={setUsername}
          style={[
            styles.input,
            feedback && !feedback.hasPassed && styles.inputError,
          ]}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={[
            styles.input,
            feedback && !feedback.hasPassed && styles.inputError,
          ]}
        />
        {errorText && <Text style={styles.errorText}>{errorText}</Text>}
        {!errorText && (
          <View style={styles.feedbackContainer}>
            {feedback && !feedback.minLength && (
              <Text style={styles.errorText}>
                Password must be at least 8 characters long.
              </Text>
            )}
            {feedback && !feedback.hasUpperCase && (
              <Text style={styles.errorText}>
                Password must contain at least one uppercase letter.
              </Text>
            )}
            {feedback && !feedback.hasLowerCase && (
              <Text style={styles.errorText}>
                Password must contain at least one lowercase letter.
              </Text>
            )}
            {feedback && !feedback.hasNumbers && (
              <Text style={styles.errorText}>
                Password must contain at least one number.
              </Text>
            )}
            {feedback && !feedback.hasSpecialChar && (
              <Text style={styles.errorText}>
                Password must contain at least one special character.
              </Text>
            )}
          </View>
        )}
        <Button
          onPress={handleRegister}
          disabled={isFetching || !username || !password}
          className="mt-5"
        >
          <Text className="text-white">Register</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    padding: 32,
    borderRadius: 12,
    elevation: 5, // For shadow on Android
    shadowColor: "#000", // For shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    color: "#333",
  },
  feedbackContainer: {
    marginTop: 16,
  },
  errorText: {
    color: "red",
    marginBottom: 4,
  },

  inputError: {
    borderColor: "red",
  },
});

export default RegisterPage;
