import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import styled from '@emotion/native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface SettingsOption {
  id: string;
  title: string;
  action: () => void;
}

const settingsOptions = [
  { id: '1', title: 'Location', action: () => console.log('Location Pressed') },
  { id: '2', title: 'Share this app', action: () => console.log('Share this app Pressed') },
  { id: '3', title: 'Remove Ads', action: () => console.log('Remove Ads Pressed') },
  { id: '4', title: 'Restore Purchases', action: () => console.log('Restore Purchases Pressed') },
  { id: '5', title: 'Contact', action: () => console.log('Contact Pressed') },
  { id: '6', title: 'Provide Feedback', action: () => console.log('Provide Feedback Pressed') },
];

const SettingsScreen = () => {
  const router = useRouter();

  const handleDone = () => {
    router.back();
  };

  const renderItem = ({ item }: { item: SettingsOption }) => (
    <ItemContainer onPress={item.action}>
      <ItemText>{item.title}</ItemText>
    </ItemContainer>
  );

  return (
    <Container>
      <Header>
        <TouchableOpacity onPress={handleDone}>
          <DoneText>Done</DoneText>
        </TouchableOpacity>
      </Header>
        <Title>Settings</Title>
        <FlatList
        data={settingsOptions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <Separator />}
      />
    </Container>
  )
}

export default SettingsScreen;
const Container = styled(SafeAreaView)(({ theme }) => ({
  flex: 1,
  backgroundColor: theme.colors.background.screen,
}));

const Header = styled(View)(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'flex-start',  // Align items to the start (left) of the cross axis
  justifyContent: 'flex-start',  // Align items to the start (top) of the main axis
  padding: theme.spacing(4),
  position: 'relative',
}));

const Title = styled(Text)(({ theme }) => ({
  fontSize: 30,
  fontWeight: 'bold',
  color: theme.colors.text.primary,
  textAlign: 'center', 
  marginBottom: theme.spacing(5),
  }));

const DoneText = styled(Text)(({ theme }) => ({
  fontSize: 18, // Adjust as necessary
  color: theme.colors.text.primary,
}));


const ItemContainer = styled(TouchableOpacity)(({ theme }) => ({
  paddingVertical: theme.spacing(2),
  borderBottomWidth: 1,
  borderBottomColor: '#d3d3d3', // Light gray color
}));

const ItemText = styled(Text)(({ theme }) => ({
  fontSize: 24,
  color: theme.colors.text.primary,
}));

const Separator = styled(View)(({ theme }) => ({
  height: 1,
  backgroundColor: '#d3d3d3',
}));