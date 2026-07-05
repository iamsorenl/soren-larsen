// Shared "Month YYYY" date parsing for sorting resume-style entries
// (experience, projects) newest-first.

export const MONTHS = {
    January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
    July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

// Parses "May 2025" (or "Sep 2024") into a timestamp. "Present" and missing
// values resolve to "now" so ongoing entries sort first in newest-first order.
export const parseDate = (str) => {
    if (!str || str === 'Present') return Date.now();
    const [month, year] = str.split(' ');
    return new Date(parseInt(year, 10), MONTHS[month] ?? 0).getTime();
};
