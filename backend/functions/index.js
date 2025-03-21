/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

// Import venue-specific scrapers
const {scrapeSmallsLive} = require("./scrapers/smalls");

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// Scheduled scraper that runs daily
exports.scrapeAllJazzVenues = onSchedule({
  schedule: "0 3 * * *", // Run daily at 3:00 AM
  timeZone: "America/New_York",
  retryCount: 3,
}, async (event) => {
  logger.info("Starting scheduled jazz venue scraping...");

  try {
    // Scrape all venues
    await scrapeJazzVenues();
    logger.info("Successfully updated all jazz venues in Firestore");
    return null;
  } catch (error) {
    logger.error("Error in scheduled scrape:", error);
    throw error;
  }
});

// Manual trigger for testing
exports.manualScrapeJazzVenues = onRequest(async (req, res) => {
  try {
    logger.info("Starting manual jazz venue scrape...");

    // Scrape all venues
    const totalEvents = await scrapeJazzVenues();

    // eslint-disable-next-line max-len
    res.status(200).send(`Successfully scraped ${totalEvents} jazz events from all venues`);
  } catch (error) {
    logger.error("Error in manual scrape:", error);
    logger.error(error.stack);
    res.status(500).send("Error during scraping: " + error.message);
  }
});

/**
 * Scrapes all jazz venues and updates Firestore
 * @return {Promise<number>} Total number of events scraped
 */
async function scrapeJazzVenues() {
  let totalEvents = 0;

  // Create a batch for Firebase operations
  const batch = db.batch();

  // Scrape Smalls Live
  logger.info("Scraping Smalls Live events...");
  const smallsEvents = await scrapeSmallsLive();
  logger.info(`Found ${smallsEvents.length} Smalls Live events`);

  // Add Smalls events to the batch
  smallsEvents.forEach((event) => {
    // Create a unique ID for each event
    // eslint-disable-next-line max-len
    const eventId = `${event.venue.toLowerCase().replace(/\s+/g, "-")}-${event.date}-${
      event.band.toLowerCase().replace(/[^\w]+/g, "-")}`;

    // Add updatedAt timestamp
    event.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    // Add ID field for easier reference
    event.id = eventId;

    // Add to batch
    const ref = db.collection("events").doc(eventId);
    batch.set(ref, event, {merge: true});
  });

  totalEvents += smallsEvents.length;

  // Add more venue scrapers here as needed
  // ...
  // Commit the batch
  if (totalEvents > 0) {
    await batch.commit();
    logger.info(`Successfully committed ${totalEvents} events to Firestore`);
  } else {
    logger.warn("No events found to commit to Firestore");
  }

  return totalEvents;
}
