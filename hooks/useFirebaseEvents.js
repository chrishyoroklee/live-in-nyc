// hooks/useFirebaseEvents.js
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../app/firebase';

export function useEventsForDate(date) {
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Format date as YYYY-MM-DD
        const formattedDate = date.toISOString().split('T')[0];
        
        // Query Firestore for events on this date
        const q = query(
          collection(db, "events"), 
          where("date", "==", formattedDate)
        );
        
        const querySnapshot = await getDocs(q);
        
        // Process results into venue-based groups
        const venuesWithShows = {};
        
        querySnapshot.forEach((doc) => {
          const event = doc.data();
          const venue = event.venue;
          
          if (!venuesWithShows[venue]) {
            venuesWithShows[venue] = [];
          }
          
          venuesWithShows[venue].push({
            id: doc.id,
            band: event.band,
            time: event.time,
            doorsOpen: event.doorsOpen,
            category: event.category || 'Music',
            artists: event.artists || []
          });
        });
        
        setEvents(venuesWithShows);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchEvents();
  }, [date]);

  return { events, loading, error };
}

export function useFilteredEventsByCategory(events, category) {
  // Filter events by category
  const filteredEvents = {};
  
  Object.keys(events).forEach(venue => {
    const filteredShows = events[venue].filter(show => 
      show.category === category || !show.category
    );
    
    if (filteredShows.length > 0) {
      filteredEvents[venue] = filteredShows;
    }
  });
  
  return filteredEvents;
}