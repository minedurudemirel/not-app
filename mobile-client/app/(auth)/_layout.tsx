import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: "Giriş Yap" }} />
      <Stack.Screen name="register" options={{ title: "Kayıt Ol" }} />
    </Stack>
  );
}
