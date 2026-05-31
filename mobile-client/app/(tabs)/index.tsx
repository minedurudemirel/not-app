import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { Redirect } from "expo-router";

export default function HomeScreen() {
  const { isLoggedIn, logout } = useAuth();

  // Kullanıcı giriş yapmamışsa login ekranına yönlendir
  if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ana Sayfa</Text>
      <Text style={styles.text}>
        Hoş geldiniz! Notlarınızı sağ alttaki notlar sekmesinden görüntüleyebilirsiniz.
      </Text>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff", // ✅ Arka plan beyaz
  },
  title: { 
    fontSize: 24, 
    marginBottom: 10,
    fontWeight: "600",
    color: "#333",
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
