import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, Stack } from "expo-router";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  SafeAreaView,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Text } from "~/components/ui/text";
import { API_URL } from "~/lib/constants";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function handleLogin() {
    setIsLoggingIn(true);
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });
      const cookie = res.headers.get("set-cookie");
      if (!res.ok || !cookie) {
        setErrorText("Invalid username or password");
        return;
      }
      let session: string | null = null;
      cookie.split(";").forEach((cookie) => {
        const [key, value] = cookie.split("=");
        if (key == "session") {
          session = value;
          return;
        }
      });
      if (!session) {
        setErrorText("Invalid username or password");
        return;
      }
      await AsyncStorage.setItem("session", session);
      router.push("/");
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: "Login",
        }}
      />
      <View style={styles.content}>
        <Text style={styles.subtitle}>Please login with your credentials</Text>

        <TextInput
          placeholder="Username"
          placeholderTextColor="#a1a1a1"
          onChangeText={setUsername}
          style={[styles.input, errorText && styles.inputError]}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#a1a1a1"
          onChangeText={setPassword}
          style={[styles.input, errorText && styles.inputError]}
          secureTextEntry
        />

        <TouchableOpacity
          style={[
            styles.button,
            (isLoggingIn || !username || !password) && styles.buttonDisabled,
          ]}
          onPress={async () => await handleLogin()}
          disabled={isLoggingIn || !username || !password}
        >
          <Text style={styles.buttonText}>
            {isLoggingIn ? "Logging in..." : "Log In"}
          </Text>
        </TouchableOpacity>

        {errorText && <Text style={styles.errorMessage}>{errorText}</Text>}
        {feedback && !feedback.minLength && (
          <Text style={styles.errorMessage}>
            Password must be at least 8 characters long.
          </Text>
        )}
        {feedback && !feedback.hasUpperCase && (
          <Text style={styles.errorMessage}>
            Password must contain at least one uppercase letter.
          </Text>
        )}
        {feedback && !feedback.hasLowerCase && (
          <Text style={styles.errorMessage}>
            Password must contain at least one lowercase letter.
          </Text>
        )}
        {feedback && !feedback.hasNumbers && (
          <Text style={styles.errorMessage}>
            Password must contain at least one number.
          </Text>
        )}
        {feedback && !feedback.hasSpecialChar && (
          <Text style={styles.errorMessage}>
            Password must contain at least one special character.
          </Text>
        )}

        <View className="mt-5 justify-end">
          <Link href="/auth/register" className="text-blue-500 hover:underline">
            Don't have an account? Register
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  initializingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20, // Space between logo and form
  },
  logo: {
    width: 300, // Adjust width as needed
    height: 150, // Adjust height as needed
    resizeMode: "contain", // Make sure the logo scales nicely
  },
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    paddingTop: 100,
    paddingHorizontal: 24,
  },
  content: {
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
    fontSize: 30,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 24,
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
  inputError: {
    borderColor: "#e74c3c",
  },
  errorMessage: {
    color: "#e74c3c",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "#ddd",
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  link: {
    marginTop: 12,
    alignItems: "center",
  },
  linkText: {
    color: "#007BFF",
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  signupText: {
    color: "#555",
    fontSize: 14,
  },
});

export default Login;
