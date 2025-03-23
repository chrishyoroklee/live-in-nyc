import React, { useState } from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator, FlatList, Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@emotion/react';
import styled from '@emotion/native';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '@/components/searchbar/SearchBar';
import { useRouter } from 'expo-router';
import { useEventsForDate, useFilteredEventsByCategory } from '../hooks/useFirebaseEvents';

interface Show {
  id: string;
  time: string;
  doorsOpen: string;
  band: string;
  category?: string;
}

interface VenueShows {
  [venue: string]: Show[];
}

interface Schedule {
  [date: string]: VenueShows;
}

interface DayCircleProps {
  isSelected: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  // const [isLoading, setIsLoading] = useState(true); // State to manage loading
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('Music');
  // const [shows, setShows] = useState<{ venue: string; shows: Show[] }[]>([]);

  // Use our custom Firebase hook
  const { events, loading, error } = useEventsForDate(selectedDay);
  
  // Filter events by category
  const filteredEvents = useFilteredEventsByCategory(events, selectedCategory);
  
  // Convert filtered events to the format expected by your existing rendering code
  const showsArray = Object.entries(filteredEvents).map(([venue, shows]) => ({ 
    venue, 
    shows 
  }));

  const formattedDate = selectedDay.toISOString().split('T')[0];

  const handleDayChange = (dayIndex: number) => {
    const today = new Date();
    const todayIndex = today.getDay();
    const diff = dayIndex - todayIndex;
    const selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diff, 12, 0, 0);
    setSelectedDay(selectedDate);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // const filteredShows = shows.filter(venueWithShows => 
  //   venueWithShows.shows.some(show => show.category === selectedCategory)
  // );
  
  const handleSettingsScreen = () => {
    router.push('/settings');
  };

  const handleFavoritesScreen = () => {
    router.push('/favorites');
  };

  const handleDetailsScreen = () => {
    router.push('/details');
  };

  const handleLoadingScreen = () => {
    router.push('/loadingScreen');
  };

  return (
    <Container>
        <Header>
            <TouchableOpacity onPress={handleSettingsScreen}>
                <Ionicons name="settings-outline" size={24} color={theme.colors.text.primary}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleFavoritesScreen}>
                <Ionicons name="heart-outline" size={24} color={theme.colors.button.primary} />
            </TouchableOpacity>
        </Header>

        <ImageContainer>
          <Image 
            source={require('../assets/images/logo.png')}
            style={{ width: 150, height: 100 }}
            resizeMode="contain"
          />
        </ImageContainer>

        <SearchBar placeholder="Artists, venues, and events"/>

        {/* <TouchableOpacity onPress={handleLoadingScreen} style={{ marginTop: 20, marginBottom: 20 }}>
            <Text>Go to Loading Screen</Text>
        </TouchableOpacity> */}

        <CategorySelector>
          <CategoryButton
            isSelected ={selectedCategory === 'Music'}
            onPress={() => handleCategoryChange('Music')}
          >
            <CategoryText isSelected ={selectedCategory === 'Music'}>Music</CategoryText>
          </CategoryButton>
          <CategoryButton
            isSelected ={selectedCategory === 'Theatre'}
            onPress={() => handleCategoryChange('Theatre')}
          >
            <CategoryText isSelected ={selectedCategory === 'Theatre'}>Theatre</CategoryText>
          </CategoryButton>
          <CategoryButton
            isSelected ={selectedCategory === 'Art'}
            onPress={() => handleCategoryChange('Art')}
          >
            <CategoryText isSelected ={selectedCategory === 'Art'}>Art</CategoryText>
          </CategoryButton>
        </CategorySelector>
        
        <DaySelector>
          <FlatList
            horizontal
            data={days}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => handleDayChange(index)}>
                <DayCircle isSelected={selectedDay.getDay() === index}>
                  <DayText>{item}</DayText>
                </DayCircle>
              </TouchableOpacity>
            )}
          />
        </DaySelector>
        <SeeAll onPress={handleDetailsScreen}>
            <SeeAllText>See all {'>'}</SeeAllText>
        </SeeAll>
        
        <Content contentContainerStyle={{ alignItems: 'center', paddingVertical: theme.spacing(5) }}>
        {loading ? (
          <ActivityIndicator size={36} color={theme.colors.button.primary} />
        ) : error ? (
          <NoEventsText>Error loading events. Please try again.</NoEventsText>
        ) : showsArray.length === 0 ? (
          <NoEventsText>No events available for this category.</NoEventsText>      
        ) : (
          showsArray.map(({ venue, shows }) => (
            <View key={venue} style={{ width: '100%' }}>
              {shows.map((show: Show) => (
                <TouchableOpacity
                  key={show.id}
                  onPress={() => router.push({
                    pathname: '/event',
                    params: { venue: venue, date: formattedDate }
                  })}
                  style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    width: '90%', 
                    alignSelf: 'flex-start' 
                  }}
                >
                  <VenueCardContainer>
                    <VenueCard>
                      <VenueName>{venue}</VenueName>
                    </VenueCard>
                    <TextContainer>
                      <BandName>{show.band}</BandName>
                      <EventDetails>{show.time}</EventDetails>
                      <TimeDetails>{`Doors Open: ${show.doorsOpen}`}</TimeDetails>
                    </TextContainer>
                  </VenueCardContainer>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </Content>
    </Container>
  );
}

const Container = styled(SafeAreaView)(({ theme }) => ({
  flex: 1,
  backgroundColor: theme.colors.background.screen,
}));

const ImageContainer = styled(View)(({ theme }) => ({
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: theme.spacing(-6),
  marginBottom: theme.spacing(-2), 
}));

const CategorySelector = styled(View)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'flex-start',
  paddingLeft: theme.spacing(2),
  paddingVertical: theme.spacing(3),
  backgroundColor: theme.colors.background.primary
}));

const CategoryButton = styled(TouchableOpacity)<{ isSelected: boolean }>(({ theme, isSelected }) => ({
  backgroundColor: isSelected ? theme.colors.button.primary : theme.colors.button.secondary,
  padding: theme.spacing(2),
  borderRadius: theme.spacing(6),
  marginHorizontal: theme.spacing(2),
}));

const CategoryText = styled(Text)<{ isSelected: boolean }>(({ theme, isSelected }) => ({
  color: isSelected ? theme.colors.text.primary : theme.colors.text.secondary,
  fontWeight: 'bold',
}));

const Header = styled(View)(({ theme }) => ({
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing(4),
}));

const DaySelector = styled(View)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: theme.spacing(2),
  paddingTop: theme.spacing(4),
}));

const DayCircle = styled(View)<DayCircleProps>(({ theme, isSelected }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  marginHorizontal: 6,
  borderWidth: isSelected ? 1 : 0, 
  borderColor: isSelected ? theme.colors.text.primary : undefined,
  marginRight: 8,
}));

const DayText = styled(Text)(({ theme }) => ({
  color: theme.colors.text.primary,
  fontWeight: 'bold',
  fontSize: 24,
}));

const SeeAll = styled(TouchableOpacity)(({ theme }) => ({
  alignItems: 'flex-end',
  paddingRight: theme.spacing(6),
  paddingTop: theme.spacing(4),
}));

const SeeAllText = styled(Text)(({ theme }) => ({
  color: theme.colors.button.primary,
  fontWeight: 'bold',
  fontSize: 16,
}));

const Content = styled.ScrollView({
  flex: 1,
  flexGrow: 1,
});

const VenueCardContainer = styled(View)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
  width: '90%', 
  alignSelf: 'flex-start', 
}));

const VenueCard = styled(View)(({ theme }) => ({
  flexDirection: 'row',  
  alignItems: 'center',
  backgroundColor: theme.colors.background.screen,
  borderRadius: 10,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  marginLeft: theme.spacing(8),
  borderColor: theme.colors.border.primary,
  borderWidth: 1,
  height: 80,  
  width: '40%',
  alignSelf: 'flex-start', 
}));

const TextContainer = styled(View)(({ theme }) => ({
  flexDirection: 'column',  
  justifyContent: 'center',  
  paddingLeft: theme.spacing(4),  
  width: '70%',  
}));

const VenueName = styled(Text)(({ theme }) => ({
  fontSize: 15,
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
  color: theme.colors.text.primary,
  flexWrap: 'wrap',
  width: '100%'
}));

const BandName = styled(Text)(({ theme }) => ({
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
  color: theme.colors.text.primary,
  flexWrap: 'wrap',
  width: '100%'
}));

const EventDetails = styled(Text)(({ theme }) => ({
  fontSize: 16,
  color: theme.colors.text.secondary,
  marginBottom: theme.spacing(1),
}));

const TimeDetails = styled(Text)(({ theme }) => ({
  fontSize: 14,
  color: theme.colors.text.secondary,
}));


const NoEventsText = styled(Text)(({ theme }) => ({
  color: theme.colors.text.secondary,
  fontSize: 18,
  textAlign: 'center',
  marginTop: theme.spacing(5),
}));