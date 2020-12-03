import moment from 'moment';

/**
 * Parse aired string
 * @param data
 * @return {string}
 */
export function parseAired(data: any): string {
    if (!data.startDate.day) {
        return 'Unknown';
    }

    let aired = moment(new Date(data.startDate.year, data.startDate.month - 1, data.startDate.day)).format('MMM D, YYYY');
    if (data.endDate.day) aired += ' to ' + moment(new Date(data.endDate.year, data.endDate.month - 1, data.endDate.day)).format('MMM D, YYYY');

    return aired;
}

/**
 * Parse color
 * @param color
 * @param {number} defaultColor
 * @return {number}
 */
export function parseColor(color: any, defaultColor: number): number {
    return color ? parseInt(color.slice(1), 16) : defaultColor;
}