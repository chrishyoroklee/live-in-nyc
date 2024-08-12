import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import styled from '@emotion/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@emotion/react'

const SmallsScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <Container>
      <Header>
        <TouchableOpacity onPress={handleBack}>
          <VenueText>Back</VenueText>
        </TouchableOpacity>
        <Title>smalls</Title>
      </Header>
      
      <DateSelector>
            <Ionicons name="chevron-back-outline" size={24} color={theme.colors.text.primary}/>
            <DateText>{`Sunday, Aug 11`}</DateText>
            <Ionicons name="chevron-forward-outline" size={24} color={theme.colors.text.primary}/>
        </DateSelector>
    </Container>
  )
}

export default SmallsScreen;

const Container = styled(SafeAreaView)(({ theme }) => ({
  flex: 1,
  backgroundColor: theme.colors.background.screen,
}));

const Header = styled(View)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing(8),
    position: 'relative',
}));

const Title = styled(Text)(({ theme }) => ({
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    position: 'absolute',
    left: '50%',
  }));

const DateSelector = styled(View)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(5),
  marginTop: theme.spacing(2),
}));

const DateText = styled(Text)(({ theme }) => ({
  fontSize: 18,
  fontWeight: 'bold',
  color: theme.colors.text.primary,
  marginHorizontal: theme.spacing(2),
}));

const Circle = styled(View)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  borderColor: theme.colors.text.primary,
  borderWidth: 1,
  marginRight: theme.spacing(3),
}));

const VenueText = styled(Text)(({ theme }) => ({
  fontSize: 16,
  color: 'theme.colors.buttonText.primary',
}));

const VenueContainer = styled(View)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  width: '90%',
  paddingVertical: theme.spacing(2),
  borderBottomColor: theme.colors.border.primary,
  borderBottomWidth: 1,
}));