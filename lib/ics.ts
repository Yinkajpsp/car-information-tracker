import { MotResult } from './types';

export function generateMotReminderIcs(data: MotResult): string {
    // Parse the expiry date to get components
    // Assuming motExpiryDate is YYYY-MM-DD
    const expiryDate = data.motExpiryDate.replace(/-/g, '');

    // Create a unique identifier
    const uid = `${Date.now()}-${data.registration.replace(/\s/g, '')}@mot-tracker.com`;

    // Format now date for DTSTAMP
    const now = new Date();
    const dtStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    // Construct the ICS file content
    // DTSTART;VALUE=DATE specifies an all-day event
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Car MOT Tracker//EN',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART;VALUE=DATE:${expiryDate}`,
        `SUMMARY:MOT due for ${data.registration}`,
        `DESCRIPTION:Your MOT for ${data.make} ${data.model} (${data.registration}) expires on ${data.motExpiryDate}.`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
}
