class TimeCalculator {
    constructor(startDate, timezone) {
        this.startDate = new Date(startDate);
        this.timezone = timezone;
    }

    // Get the current time in Cairo timezone
    getCurrentTime() {
        return new Date().toLocaleString("en-US", { timeZone: this.timezone });
    }

    // Calculate the difference between now and start date
    calculateTimeDifference() {
        const now = new Date(this.getCurrentTime());
        const timeDiff = now - this.startDate;
        
        // Total values
        const totalSeconds = Math.floor(timeDiff / 1000);
        const totalMinutes = Math.floor(timeDiff / (1000 * 60));
        const totalHours = Math.floor(timeDiff / (1000 * 60 * 60));
        const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const totalWeeks = Math.floor(totalDays / 7);

        // Calculate true calendar months and years
        let totalMonths = 0;
        const dateIterator = new Date(this.startDate);
        
        while (dateIterator <= now) {
            dateIterator.setMonth(dateIterator.getMonth() + 1);
            if (dateIterator <= now) totalMonths++;
        }

        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;

        return {
            years: years.toString().padStart(2, '0'),
            months: months.toString().padStart(2, '0'),
            weeks: totalWeeks.toString().padStart(2, '0'),
            days: totalDays.toString().padStart(3, '0'),
            hours: totalHours.toString().padStart(4, '0'),
            minutes: totalMinutes.toString().padStart(5, '0'),
            seconds: totalSeconds.toString().padStart(5, '0'),
            isMonthAnniversary: this.isMonthAnniversary(now)
        };
    }

    // Check if today is a monthly anniversary
    isMonthAnniversary(now) {
        return now.getDate() === this.startDate.getDate() &&
               now > this.startDate;
    }
}
