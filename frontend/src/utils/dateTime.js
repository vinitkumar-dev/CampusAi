/*
 * Centralized date/time helpers. Every timestamp shown in the app goes
 * through this file so it is always rendered in India Standard Time
 * (Asia/Kolkata, UTC+05:30), regardless of the viewer's browser timezone.
 *
 * Backend note: the API serialises DB DATETIME values with isoformat() and
 * no offset (e.g. "2026-10-02T17:15:00"). Those are treated as UTC here. If
 * your MySQL server stores local (IST) time instead, change
 * BACKEND_NAIVE_TIMESTAMP_OFFSET below to "+05:30" - that is the only place
 * that needs to change.
 */

export const APP_TIME_ZONE = "Asia/Kolkata";
export const BACKEND_NAIVE_TIMESTAMP_OFFSET = "Z"; // naive backend timestamps are UTC

const HAS_ZONE = /(Z|[+-]\d{2}:?\d{2})$/i;
const NAIVE_DATETIME = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/;

/**
 * Parse a backend/ISO value into a Date (an absolute instant).
 * Returns null for empty or invalid input.
 */
export const parseTimestamp = (value) => {
  if (value === null || value === undefined || value === "") return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  let text = String(value).trim();

  // Timestamps without an explicit zone would otherwise be read as the
  // browser's local time. Pin them to the backend's zone first.
  if (NAIVE_DATETIME.test(text) && !HAS_ZONE.test(text)) {
    text = `${text.replace(" ", "T")}${BACKEND_NAIVE_TIMESTAMP_OFFSET}`;
  }

  const d = new Date(text);
  return Number.isNaN(d.getTime()) ? null : d;
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TIME_ZONE,
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const longDateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TIME_ZONE,
  month: "short",
  year: "numeric",
});

/** "02 Oct 2026" */
export const formatDateIST = (value, fallback = "-") => {
  const d = parseTimestamp(value);
  return d ? dateFormatter.format(d) : fallback;
};

/** "10:45 PM" */
export const formatTimeIST = (value, fallback = "-") => {
  const d = parseTimestamp(value);
  return d ? timeFormatter.format(d).toUpperCase() : fallback;
};

/** "02 Oct 2026, 10:45 PM" */
export const formatDateTimeIST = (value, fallback = "-") => {
  const d = parseTimestamp(value);
  if (!d) return fallback;
  return `${dateFormatter.format(d)}, ${timeFormatter.format(d).toUpperCase()}`;
};

/** "Fri, 2 Oct 2026" - the current (or given) day in IST, for headers. */
export const formatLongDateIST = (value = new Date(), fallback = "-") => {
  const d = parseTimestamp(value);
  return d ? longDateFormatter.format(d) : fallback;
};

/** "2026-10" (analytics bucket label) -> "Oct 2026". Other input is returned as-is. */
export const formatMonthLabel = (value) => {
  if (typeof value === "string" && /^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-").map(Number);
    // Noon UTC avoids any day-boundary shift when formatted in IST.
    return monthFormatter.format(new Date(Date.UTC(year, month - 1, 1, 12)));
  }
  return value;
};
