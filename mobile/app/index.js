import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>MEDIQ</Text>
      <Text style={styles.title}>Sua saúde, no horário certo.</Text>
      <Text style={styles.description}>
        Encontre profissionais, escolha um horário e acompanhe seus agendamentos.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f4faf7', flex: 1, justifyContent: 'center', padding: 28 },
  brand: { color: '#168365', fontSize: 14, fontWeight: '700', letterSpacing: 3 },
  title: { color: '#12352d', fontSize: 38, fontWeight: '700', lineHeight: 43, marginTop: 16 },
  description: { color: '#49645c', fontSize: 17, lineHeight: 26, marginTop: 20 }
});
