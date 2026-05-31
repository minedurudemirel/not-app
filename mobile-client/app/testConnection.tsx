import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import axios from 'axios';

const API_URL = 'http://10.42.89.60:5000';

export default function TestConnection() {
  const [status, setStatus] = useState('');

  const checkConnection = async () => {
    try {
      const res = await axios.get(API_URL);
      setStatus(res.data);
    } catch (error: any) {
      setStatus('Bağlantı hatası: ' + (error.message || 'Bilinmeyen hata'));
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Bağlantıyı Test Et" onPress={checkConnection} />
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginTop: 20, fontSize: 16 },
});
