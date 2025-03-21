// scrapers/smalls.js
const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Scrapes event data from Smalls Live website
 * @return {Promise<Array>} Array of event objects
 */
async function scrapeSmallsLive() {
  try {
    // Fetch the Smalls Live website
    const response = await axios.get("https://www.smallslive.com/");
    const $ = cheerio.load(response.data);
    const events = [];

    // Each event is in an "article" element
    // with class "event-display-today-and-tomorrow"
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

        // Parse the date (e.g., "Sat Mar 22" to a Date object)
        const dateMatch = dateText.match(/(\w{3})\s+(\w{3})\s+(\d{1,2})/);
        if (!dateMatch) {
          console.warn(`Could not parse date: ${dateText}`);
          return;
        }

        const month = dateMatch[2];
        const day = dateMatch[3].padStart(2, "0");
        const year = "2025"; // Current year

        // Convert month name to number
        const monthNames = {
          "Jan": "01", "Feb": "02", "Mar": "03",
          "Apr": "04", "May": "05", "Jun": "06",
          "Jul": "07", "Aug": "08", "Sep": "09",
          "Oct": "10", "Nov": "11", "Dec": "12",
        };

        const monthNum = monthNames[month];
        if (!monthNum) {
          console.warn(`Could not parse month: ${month}`);
          return;
        }

        const formattedDate = `${year}-${monthNum}-${day}`;

        // Create event object
        const event = {
          venue: venue,
          date: formattedDate,
          band: eventTitle,
          time: timeText.replace("Sets at ", "").replace("From '", ""),
          doorsOpen: "30 minutes before showtime",
          category: "Music",
          artists: artists,
          eventUrl: "https://www.smallslive.com" + eventUrl,
        };

        events.push(event);
      } catch (err) {
        console.error(`Error processing event ${i}:`, err);
      }
    });

    return events;
  } catch (error) {
    console.error("Error scraping Smalls Live events:", error);
    throw error;
  }
}

module.exports = {scrapeSmallsLive};
