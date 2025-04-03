/* eslint-disable max-len */
// scrapers/smalls.js
const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Scrapes event data from Smalls Live website
 * @return {Promise<Array>} Array of event objects
 */
async function scrapeSmallsLive() {
  try {
    // Array to store all events
    let allEvents = [];

    // Step 1: Fetch the main page and extract current events
    console.log("Fetching main Smalls Live page...");
    const response = await axios.get("https://www.smallslive.com/");
    const $ = cheerio.load(response.data);

    // Process events from the "today and tomorrow" section
    const currentEvents = processCurrentEvents($);
    allEvents = [...currentEvents];
    console.log(`Found ${currentEvents.length} events in current section`);

    // // Step 2: Fetch upcoming events via AJAX endpoint
    // console.log("Fetching upcoming events...");
    // let currentPage = 1;
    // let hasMorePages = true;

    // while (hasMorePages) {
    //   console.log(`Fetching upcoming events page ${currentPage}...`);
    //   const upcomingResponse = await axios.get(
    //       `https://www.smallslive.com/search/upcoming-ajax/?page=${currentPage}&venue=all`,
    //   );

    //   // The AJAX endpoint returns JSON with HTML in a template property
    //   const upcomingData = upcomingResponse.data;

    //   if (upcomingData && upcomingData.template) {
    //     // Parse the HTML from the template
    //     const $upcoming = cheerio.load(upcomingData.template);

    //     // Process the upcoming events
    //     const upcomingEvents = processUpcomingEvents($upcoming);
    //     allEvents = [...allEvents, ...upcomingEvents];

    //     // eslint-disable-next-line max-len
    //     console.log(`Found ${upcomingEvents.length} events on page ${currentPage}`);

    //     // Check if there are more pages
    //     if (upcomingEvents.length === 0 ||
    //         // eslint-disable-next-line max-len
    //         currentPage >= upcomingData.page_range[upcomingData.page_range.length - 1]) {
    //       hasMorePages = false;
    //     } else {
    //       currentPage++;
    //     }
    //   } else {
    //     hasMorePages = false;
    //   }
    // }

    // Remove any duplicate events (same venue/date/band)
    const uniqueEvents = removeDuplicates(allEvents);
    console.log(`Total unique events: ${uniqueEvents.length}`);

    return uniqueEvents;
  } catch (error) {
    console.error("Error scraping Smalls Live events:", error);
    throw error;
  }
}

/**
 * Process events from the main page "today and tomorrow" section
 * @param {Object} $ - Cheerio instance with loaded HTML
 * @return {Array} Processed events
 */
function processCurrentEvents($) {
  const events = [];

  $("article.event-display-today-and-tomorrow").each((i, element) => {
    try {
      // Extract the band/event name
      const eventTitle = $(element).find(".event-info-title").text().trim();

      // Extract the venue
      const venueElement = $(element).find(".venue");
      let venue = "Unknown Venue";

      if (venueElement.hasClass("smalls-color")) {
        venue = "Smalls Jazz Club";
      } else if (venueElement.hasClass("mezzrow-color")) {
        venue = "Mezzrow";
      }

      // Extract the date
      // eslint-disable-next-line max-len
      const dateText = $(element).find(".sub-info__date-time .sets").first().text().trim();

      // Extract the time
      // eslint-disable-next-line max-len
      const timeText = $(element).find(".sub-info__date-time .sets").last().text().trim();

      // Extract the URL
      const eventUrl = $(element).find("a").attr("href");

      // Extract artists information
      const artists = [];
      $(element).find(".artists .artists-name").each((j, artistElement) => {
        artists.push($(artistElement).text().trim());
      });

      // Parse the date
      const formattedDate = parseDate(dateText);
      if (!formattedDate) return;

      // Create event object
      const event = {
        venue: venue,
        date: formattedDate,
        band: eventTitle,
        time: timeText.replace("Sets at ", "").replace("From ", ""),
        doorsOpen: "30 minutes before showtime",
        category: "Music",
        artists: artists,
        eventUrl: "https://www.smallslive.com" + eventUrl,
      };

      events.push(event);
    } catch (err) {
      console.error(`Error processing current event ${i}:`, err);
    }
  });

  return events;
}

/**
 * Process events from the upcoming events AJAX response
 * @param {Object} $ - Cheerio instance with loaded HTML
 * @return {Array} Processed events
 */
// function processUpcomingEvents($) {
//   const events = [];

//   // Debug the structure
//   console.log("Upcoming HTML structure check:");
//   console.log(`Found ${$(".flex-column.day-list").length} day list elements`);
//   console.log(`Found ${$(".flex-column.day-event").length} day event elements`);

//   // Start by analyzing the overall HTML structure
//   // The structure appears to be organized by days, with each day having a date header
//   // followed by multiple event elements for that day
//   const dayLists = $(".flex-column.day-list");
//   const dayEvents = $(".flex-column.day-event");

//   if (dayLists.length > 0 && dayEvents.length > 0) {
//     // First, create a mapping of all dates
//     const dayDateMap = new Map();
//     const dayPositions = [];

//     // Collect all day-list elements with their positions and parsed dates
//     dayLists.each((i, dayElement) => {
//       try {
//         // Extract the date information
//         const dateEl = $(dayElement).find(".title1");
//         const dateText = dateEl.attr("data-date") || dateEl.text().trim();
//         console.log(`Day ${i+1} date text: "${dateText}"`);

//         const formattedDate = parseDate(dateText);
//         if (formattedDate) {
//           // Record the date and its position
//           const position = $(dayElement).index();
//           dayPositions.push({
//             index: i,
//             position: position,
//             date: formattedDate,
//           });
//           dayDateMap.set(position, formattedDate);
//           console.log(`Mapped position ${position} to date ${formattedDate}`);
//         } else {
//           console.log(`Could not parse date: ${dateText}`);
//         }
//       } catch (err) {
//         console.error(`Error processing day ${i}:`, err);
//       }
//     });

//     // Sort day positions by their DOM position for easier reference
//     dayPositions.sort((a, b) => a.position - b.position);

//     // Process each day-event element
//     dayEvents.each((i, eventElement) => {
//       try {
//         // Find which day this event belongs to by looking at DOM structure
//         const eventPosition = $(eventElement).index();
//         console.log(`Event ${i} position: ${eventPosition}`);

//         // Find the correct date for this event by getting the closest preceding day-list
//         let eventDate = null;
//         let closestDayPosition = null;

//         // Find the last day-list that comes before this event
//         for (const day of dayPositions) {
//           if (day.position < eventPosition &&
//               (!closestDayPosition || day.position > closestDayPosition.position)) {
//             closestDayPosition = day;
//           }
//         }

//         if (closestDayPosition) {
//           eventDate = closestDayPosition.date;
//           console.log(`Assigned event ${i} to date ${eventDate} based on position`);
//         } else if (dayPositions.length > 0) {
//           // If we can't find a preceding day, something is wrong with the DOM structure
//           // In this case, try to locate sibling elements to determine the date

//           // Look for a date/day indicator within the event itself or nearby
//           let prevElement = $(eventElement).prev();
//           // const nextElement = $(eventElement).next();
//           let searchCount = 0;

//           // Search previous siblings for a date reference
//           while (prevElement.length > 0 && searchCount < 5) {
//             if (prevElement.hasClass("flex-column") && prevElement.hasClass("day-list")) {
//               const dateEl = prevElement.find(".title1");
//               const dateText = dateEl.attr("data-date") || dateEl.text().trim();
//               eventDate = parseDate(dateText);

//               if (eventDate) {
//                 console.log(`Found date ${eventDate} in previous sibling of event ${i}`);
//                 break;
//               }
//             }
//             prevElement = prevElement.prev();
//             searchCount++;
//           }

//           // If no date found in previous siblings, check if the event is inside a day container
//           if (!eventDate) {
//             const parentContainer = $(eventElement).parent();
//             const dayListInParent = parentContainer.find(".flex-column.day-list");

//             if (dayListInParent.length > 0) {
//               const dateEl = dayListInParent.find(".title1");
//               const dateText = dateEl.attr("data-date") || dateEl.text().trim();
//               eventDate = parseDate(dateText);

//               if (eventDate) {
//                 console.log(`Found date ${eventDate} in parent container of event ${i}`);
//               }
//             }
//           }

//           // Last resort: check event content for date information
//           if (!eventDate) {
//             // Look for date indicators in the event text
//             const eventText = $(eventElement).text();

//             // Look for date patterns in the text
//             const dateMatch = eventText.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:,\s+\d{4})?/i);
//             if (dateMatch) {
//               eventDate = parseDate(dateMatch[0]);
//               if (eventDate) {
//                 console.log(`Found date ${eventDate} in event text of event ${i}`);
//               }
//             }

//             // If still no date, use the first date in the list as a fallback
//             if (!eventDate && dayPositions.length > 0) {
//               eventDate = dayPositions[0].date;
//               console.log(`Using first available date ${eventDate} for event ${i} as fallback`);
//             }
//           }
//         }

//         if (eventDate) {
//           // Extract event information
//           const eventLink = $(eventElement).find("a");
//           const bandElement = $(eventElement).find(".text2.day_event_title");
//           const timeElement = $(eventElement).find(".text-grey.text2");
//           const venueElement = $(eventElement).find(".venue-name");

//           if (bandElement.length) {
//             const band = bandElement.text().trim();
//             const time = timeElement.length ? timeElement.text().trim() : "Time not specified";
//             const eventUrl = eventLink.attr("href");

//             // Determine venue
//             let venue = "Unknown Venue";
//             if (venueElement.length) {
//               venue = venueElement.text().trim();
//             } else if ($(eventElement).find(".smalls-color").length) {
//               venue = "Smalls Jazz Club";
//             } else if ($(eventElement).find(".mezzrow-color").length) {
//               venue = "Mezzrow";
//             }

//             // Extract artists
//             const artists = [];
//             $(eventElement).find(".artists-name").each((j, artistEl) => {
//               artists.push($(artistEl).text().trim());
//             });

//             // Look for date information in the event itself as additional validation
//             const eventDateEl = $(eventElement).find(".sets, .date, [data-date]").first();
//             if (eventDateEl.length) {
//               const eventDateText = eventDateEl.attr("data-date") || eventDateEl.text().trim();
//               const specificEventDate = parseDate(eventDateText);

//               // If we found a specific date in the event and it differs from our calculated date,
//               // use the specific date as it's more likely to be correct
//               if (specificEventDate && specificEventDate !== eventDate) {
//                 console.log(`Correcting date for event ${i} from ${eventDate} to ${specificEventDate} based on event content`);
//                 eventDate = specificEventDate;
//               }
//             }

//             const event = {
//               venue: venue,
//               date: eventDate,
//               band: band,
//               time: time.replace("Sets at ", "").replace("From ", ""),
//               doorsOpen: "30 minutes before showtime",
//               category: "Music",
//               artists: artists,
//               eventUrl: "https://www.smallslive.com" + (eventUrl || ""),
//             };

//             console.log(`Found event: ${band} on ${eventDate}`);
//             events.push(event);
//           } else {
//             console.log(`Event ${i} missing band name, skipping`);
//           }
//         } else {
//           console.log(`Could not determine date for event ${i}, skipping`);
//         }
//       } catch (err) {
//         console.error(`Error processing event ${i}:`, err);
//       }
//     });
//   } else {
//     console.log("No day-list or day-event elements found, trying alternative approach");

//     // Alternative approach: search for container elements that might group dates and events
//     const containers = $("#home-calender > div");
//     console.log(`Found ${containers.length} potential day containers`);

//     if (containers.length > 0) {
//       containers.each((i, container) => {
//         try {
//           // Check if this container has date information
//           const dayList = $(container).find(".flex-column.day-list");
//           if (dayList.length > 0) {
//             // Extract the date
//             const dateEl = dayList.find(".title1");
//             const dateText = dateEl.attr("data-date") || dateEl.text().trim();
//             const formattedDate = parseDate(dateText);

//             if (formattedDate) {
//               console.log(`Container ${i} has date: ${formattedDate}`);

//               // Find events in this container
//               const containerEvents = $(container).find(".flex-column.day-event");
//               console.log(`Container ${i} has ${containerEvents.length} events`);

//               containerEvents.each((j, eventElement) => {
//                 try {
//                   // Extract event information
//                   const eventLink = $(eventElement).find("a");
//                   const bandElement = $(eventElement).find(".text2.day_event_title");
//                   const timeElement = $(eventElement).find(".text-grey.text2");
//                   const venueElement = $(eventElement).find(".venue-name");

//                   if (bandElement.length) {
//                     const band = bandElement.text().trim();
//                     const time = timeElement.length ? timeElement.text().trim() : "Time not specified";
//                     const eventUrl = eventLink.attr("href");

//                     // Determine venue
//                     let venue = "Unknown Venue";
//                     if (venueElement.length) {
//                       venue = venueElement.text().trim();
//                     } else if ($(eventElement).find(".smalls-color").length) {
//                       venue = "Smalls Jazz Club";
//                     } else if ($(eventElement).find(".mezzrow-color").length) {
//                       venue = "Mezzrow";
//                     }

//                     // Extract artists
//                     const artists = [];
//                     $(eventElement).find(".artists-name").each((k, artistEl) => {
//                       artists.push($(artistEl).text().trim());
//                     });

//                     const event = {
//                       venue: venue,
//                       date: formattedDate,
//                       band: band,
//                       time: time.replace("Sets at ", "").replace("From ", ""),
//                       doorsOpen: "30 minutes before showtime",
//                       category: "Music",
//                       artists: artists,
//                       eventUrl: "https://www.smallslive.com" + (eventUrl || ""),
//                     };

//                     console.log(`Found event in container ${i}: ${band} on ${formattedDate}`);
//                     events.push(event);
//                   }
//                 } catch (err) {
//                   console.error(`Error processing event ${j} in container ${i}:`, err);
//                 }
//               });
//             } else {
//               console.log(`Could not parse date in container ${i}: ${dateText}`);
//             }
//           }
//         } catch (err) {
//           console.error(`Error processing container ${i}:`, err);
//         }
//       });
//     }
//   }

//   // Final check: Look for any hidden date information in event elements
//   if (events.length === 0) {
//     console.log("Trying direct event extraction as last resort");

//     dayEvents.each((i, eventElement) => {
//       try {
//         // Look for any data attributes or classes that might indicate the date
//         const eventData = $(eventElement).data();
//         console.log(`Event ${i} data attributes:`, eventData);

//         // Try to find date in any data attribute
//         let eventDate = null;

//         if (eventData && eventData.date) {
//           eventDate = parseDate(eventData.date);
//         }

//         // If no date in data attributes, check text content
//         if (!eventDate) {
//           const eventText = $(eventElement).text();
//           const dateMatches = eventText.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:,\s+\d{4})?\b/gi);

//           if (dateMatches && dateMatches.length > 0) {
//             eventDate = parseDate(dateMatches[0]);
//           }
//         }

//         if (eventDate) {
//           // Process the event
//           // (Event extraction code similar to above)
//           console.log(`Found event with direct date ${eventDate} extraction`);
//         }
//       } catch (err) {
//         console.error(`Error in direct event extraction for event ${i}:`, err);
//       }
//     });
//   }

//   console.log(`Total events found in upcoming section: ${events.length}`);
//   return events;
// }

/**
 * Parse date string to YYYY-MM-DD format
 * @param {string} dateText - The date text to parse
 * @return {string|null} Formatted date or null if invalid
 */
function parseDate(dateText) {
  try {
    // Clear up any unexpected input
    dateText = dateText.trim();

    // Format 1: "Sun Mar 23"
    const shortDateMatch = dateText.match(/(\w{3})\s+(\w{3})\s+(\d{1,2})/);
    if (shortDateMatch) {
      const month = shortDateMatch[2];
      const day = shortDateMatch[3].padStart(2, "0");
      const year = new Date().getFullYear().toString();

      // Convert month name to number
      const monthNames = {
        "Jan": "01", "Feb": "02", "Mar": "03",
        "Apr": "04", "May": "05", "Jun": "06",
        "Jul": "07", "Aug": "08", "Sep": "09",
        "Oct": "10", "Nov": "11", "Dec": "12",
      };

      const monthNum = monthNames[month];
      if (!monthNum) {
        console.log(`Could not parse short month: ${month}`);
        return null;
      }

      return `${year}-${monthNum}-${day}`;
    }

    // Format 2: "March 23, 2025" or "April 1, 2025"
    const longDateMatch = dateText.match(/([A-Za-z]+)\s+(\d{1,2})(?:,)?\s+(\d{4})?/);
    if (longDateMatch) {
      const monthName = longDateMatch[1];
      const day = parseInt(longDateMatch[2]).toString().padStart(2, "0");
      // If year is not specified, use current year
      const year = longDateMatch[3] || new Date().getFullYear().toString();

      // Convert full month name to number
      const fullMonthNames = {
        "January": "01", "February": "02", "March": "03",
        "April": "04", "May": "05", "June": "06",
        "July": "07", "August": "08", "September": "09",
        "October": "10", "November": "11", "December": "12",
      };

      // Try with the full name first
      let monthNum = fullMonthNames[monthName];

      // If not found, try to match by prefix (e.g., "Mar" for "March")
      if (!monthNum) {
        const prefix = monthName.substring(0, 3);
        const monthEntry = Object.entries(fullMonthNames).find(([name]) =>
          name.substring(0, 3).toLowerCase() === prefix.toLowerCase(),
        );

        if (monthEntry) {
          monthNum = monthEntry[1];
        }
      }

      if (!monthNum) {
        console.log(`Could not parse month name: ${monthName}`);
        return null;
      }

      return `${year}-${monthNum}-${day}`;
    }

    // eslint-disable-next-line max-len
    // If neither format matches, try a more permissive approach with Date object
    try {
      const date = new Date(dateText);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    } catch (innerErr) {
      // Silently fail and continue to the warning
    }

    // If all methods fail
    console.log(`Could not parse date: ${dateText}`);
    return null;
  } catch (err) {
    console.error(`Error parsing date ${dateText}:`, err);
    return null;
  }
}

/**
 * Remove duplicate events (same venue, date and band)
 * @param {Array} events - List of events
 * @return {Array} Deduplicated events
 */
function removeDuplicates(events) {
  const uniqueKeys = new Set();
  return events.filter((event) => {
    const key = `${event.venue}-${event.date}-${event.band}`;
    if (uniqueKeys.has(key)) {
      return false;
    }
    uniqueKeys.add(key);
    return true;
  });
}

module.exports = {scrapeSmallsLive};
