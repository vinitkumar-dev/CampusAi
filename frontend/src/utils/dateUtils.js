// Single source of truth for user-facing dates/times.
// Output is always Indian standard, Asia/Kolkata (IST), regardless of the
// browser's timezone:
//   date      -> 02/10/2026
//   time      -> 09:30 PM
//   date+time -> 02/10/2026, 09:30 PM

export const IST_TIMEZONE = "Asia/Kolkata";

const FALLBACK = "N/A";

// The API serialises DB timestamps with .isoformat() and NO timezone suffix
// (e.g. "2026-10-02T16:00:00"), which are UTC. new Date() would read such a
// string as *browser-local* time, shifting it. Treat zone-less strings as UTC.
const HAS_ZONE = /(Z|[+-]\d{2}:?\d{2})$/i;

export const parseDate = (value) => {
  if (value === null || value === undefined || value === "") return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string") {
    let str = value.trim();
    if (!str) return null;
    // "2026-10-02 16:00:00" -> ISO form
    str = str.replace(" ", "T");
    if (/^\d{4}-\d{2}-\d{2}T/.test(str) && !HAS_ZONE.test(str)) {
      str += "Z";
    }
    const d = new Date(str);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const partsOf = (date, options) => {
  const out = {};
  new Intl.DateTimeFormat("en-GB", {
    timeZone: IST_TIMEZONE,
    hourCycle: "h12",
    ...options,
  })
    .formatToParts(date)
    .forEach((p) => {
      out[p.type] = p.value;
    });
  return out;
};

const datePart = (d) => {
  const p = partsOf(d, { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${p.day}/${p.month}/${p.year}`;
};

const timePart = (d) => {
  const p = partsOf(d, { hour: "2-digit", minute: "2-digit" });
  return `${p.hour}:${p.minute} ${String(p.dayPeriod).toUpperCase()}`;
};

export const formatIndianDate = (value, fallback = FALLBACK) => {
  const d = parseDate(value);
  return d ? datePart(d) : fallback;
};

export const formatIndianTime = (value, fallback = FALLBACK) => {
  const d = parseDate(value);
  return d ? timePart(d) : fallback;
};

export const formatIndianDateTime = (value, fallback = FALLBACK) => {
  const d = parseDate(value);
  return d ? `${datePart(d)}, ${timePart(d)}` : fallback;
};

// "Today" header, e.g. "Fri, 02/10/2026" (IST)
export const formatIndianWeekdayDate = (value = new Date()) => {
  const d = parseDate(value);
  if (!d) return FALLBACK;
  const wd = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST_TIMEZONE,
    weekday: "short",
  }).format(d);
  return `${wd}, ${datePart(d)}`;
};
