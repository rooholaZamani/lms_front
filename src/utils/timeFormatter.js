/**
 * Centralized time formatting utilities for Iran timezone
 * Fixes the one-hour offset issue in analytics dashboard
 */

const IRAN_TIMEZONE = 'Asia/Tehran';
const PERSIAN_LOCALE = 'fa-IR';

/**
 * Format date for timeline display with proper Iran timezone handling
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted relative or absolute time string
 */
export function formatTimelineDate(dateString) {
  if (!dateString) return '';

  // Parse the input date - backend sends dates in Iran timezone
  const date = new Date(dateString);

  // Get current time in Iran timezone
  const now = new Date();

  // Calculate the difference in milliseconds
  const diff = now - date;

  // Convert to different time units
  const minutes = Math.floor(diff / (60 * 1000));
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));

  // Return relative time for recent activities
  // if (diff < 0) {
  //   // Future date - shouldn't happen but handle gracefully
  //   return 'در آینده';
  if (minutes < 1) {
    return 'همین الان';
  } else if (minutes < 60) {
    return `${minutes} دقیقه پیش`;
  } else if (hours < 24) {
    return `${hours} ساعت پیش`;
  } else if (days < 7) {
    return `${days} روز پیش`;
  } else {
    // For older dates, show formatted date in Iran timezone
    return new Intl.DateTimeFormat(PERSIAN_LOCALE, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: IRAN_TIMEZONE
    }).format(date);
  }
}

/**
 * Format date with full details in Iran timezone
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted full date string
 */
export function formatFullDate(dateString) {
  if (!dateString) return 'نامشخص';

  const date = new Date(dateString);
  return new Intl.DateTimeFormat(PERSIAN_LOCALE, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: IRAN_TIMEZONE
  }).format(date);
}

/**
 * Format date for short display (date only)
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date string
 */
export function formatShortDate(dateString) {
  if (!dateString) return 'نامشخص';

  const date = new Date(dateString);
  return new Intl.DateTimeFormat(PERSIAN_LOCALE, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: IRAN_TIMEZONE
  }).format(date);
}

/**
 * Format time duration in seconds to readable Persian format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted time string
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '0 ثانیه';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours} ساعت و ${minutes} دقیقه`;
  } else if (minutes > 0) {
    return `${minutes} دقیقه و ${secs} ثانیه`;
  } else {
    return `${secs} ثانیه`;
  }
}

/**
 * Get current time in Iran timezone for logging/debugging
 * @returns {string} Current Iran time
 */
export function getCurrentIranTime() {
  return new Intl.DateTimeFormat(PERSIAN_LOCALE, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: IRAN_TIMEZONE
  }).format(new Date());
}

/**
 * Check if a date is today in Iran timezone
 * @param {string|Date} dateString - Date to check
 * @returns {boolean} True if the date is today
 */
export function isToday(dateString) {
  if (!dateString) return false;

  const date = new Date(dateString);
  const today = new Date();

  const dateStr = date.toLocaleDateString('en-CA', { timeZone: IRAN_TIMEZONE });
  const todayStr = today.toLocaleDateString('en-CA', { timeZone: IRAN_TIMEZONE });

  return dateStr === todayStr;
}