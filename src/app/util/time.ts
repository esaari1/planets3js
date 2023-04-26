export function daysSinceEpoch(d: Date = new Date()) {
    const dayNumber = dateToDayNumber(d);
    const year = d.getFullYear();

    if (year < 1990) {
        const leapCount = leapYearsInRange(year, 1990);
        return -365 * (1990 - year) - leapCount + dayNumber;
    } else if (year > 1990) {
        const leapCount = leapYearsInRange(1990, year);
        return 365 * (year - 1990) + leapCount + dayNumber;
    }

    return dayNumber;
}

export function timeSinceEpoch(d: Date = new Date()) {
    const days = daysSinceEpoch(d);
    const t = (((d.getSeconds() / 60 + d.getMinutes()) / 60) + d.getHours()) / 24;
    return days + t;
}

export function dateToDayNumber(d: Date) {
    let month = d.getMonth() + 1;

    if (month > 2) {
        month = Math.floor((month + 1) * 30.6);
        if (isLeapYear(d.getFullYear())) {
            month = month - 62;
        } else {
            month = month - 63;
        }
    } else {
        month--;
        if (isLeapYear(d.getFullYear())) {
            month *= 62;
        } else {
            month *= 63;
        }

        month = Math.floor(month / 2);
    }

    return month + d.getDate();
}

export function isLeapYear(year: number): boolean {
    if (year % 4 !== 0) {
        return false;
    }
    if (year % 100 !== 0) {
        return true;
    }
    if (year % 400 === 0) {
        return true;
    }
    return false;
}

function leapYearCount(year: number): number {
    return Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400);
}

function leapYearsInRange(year1: number, year2: number): number {
    const num1 = leapYearCount(year2);
    const num2 = leapYearCount(year1 - 1);
    return num1 - num2;
}
