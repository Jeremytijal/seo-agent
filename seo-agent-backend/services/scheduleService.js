/**
 * Schedule Service
 * Handles timing logic for agent responses
 */

class ScheduleService {
    /**
     * Check if current time is within agent's operating hours
     * @param {Object} schedule - { startTime: "09:00", endTime: "18:00", days: ["L", "M", "Me", "J", "V"] }
     * @param {string} timezone - Timezone (default: Europe/Paris)
     * @returns {boolean}
     */
    isWithinSchedule(schedule, timezone = 'Europe/Paris') {
        if (!schedule || !schedule.startTime || !schedule.endTime) {
            return true; // No schedule = always available
        }

        const now = new Date();
        
        // Convert to specified timezone
        const options = { timeZone: timezone };
        const localTime = new Date(now.toLocaleString('en-US', options));
        
        const currentHour = localTime.getHours();
        const currentMinute = localTime.getMinutes();
        const currentDay = localTime.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Map day number to French abbreviation
        const dayMap = {
            0: 'D',  // Dimanche
            1: 'L',  // Lundi
            2: 'M',  // Mardi
            3: 'Me', // Mercredi
            4: 'J',  // Jeudi
            5: 'V',  // Vendredi
            6: 'S'   // Samedi
        };

        const currentDayAbbrev = dayMap[currentDay];

        // Check if current day is in schedule
        if (schedule.days && schedule.days.length > 0) {
            if (!schedule.days.includes(currentDayAbbrev)) {
                console.log(`Outside schedule: Day ${currentDayAbbrev} not in ${schedule.days}`);
                return false;
            }
        }

        // Parse start and end times
        const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
        const [endHour, endMinute] = schedule.endTime.split(':').map(Number);

        const currentTotalMinutes = currentHour * 60 + currentMinute;
        const startTotalMinutes = startHour * 60 + startMinute;
        const endTotalMinutes = endHour * 60 + endMinute;

        const isWithin = currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes;
        
        if (!isWithin) {
            console.log(`Outside schedule: ${currentHour}:${currentMinute} not between ${schedule.startTime} and ${schedule.endTime}`);
        }

        return isWithin;
    }

    /**
     * Calculate delay for human-like behavior
     * @param {string} behaviorMode - "human" or "assistant"
     * @param {number} responseDelay - Delay in minutes (1-5)
     * @returns {number} - Delay in milliseconds
     */
    calculateResponseDelay(behaviorMode, responseDelay = 2) {
        if (behaviorMode !== 'human') {
            return 0; // Instant response for assistant mode
        }

        // Add some randomness to make it more natural
        const baseDelayMs = responseDelay * 60 * 1000; // Convert minutes to ms
        const variance = baseDelayMs * 0.3; // 30% variance
        const randomOffset = (Math.random() - 0.5) * 2 * variance;
        
        const finalDelay = Math.max(30000, baseDelayMs + randomOffset); // Minimum 30 seconds
        
        console.log(`Human mode: Adding ${Math.round(finalDelay / 1000)}s delay`);
        return finalDelay;
    }

    /**
     * Get next available time slot
     * @param {Object} schedule
     * @param {string} timezone
     * @returns {Date}
     */
    getNextAvailableSlot(schedule, timezone = 'Europe/Paris') {
        if (!schedule || !schedule.startTime) {
            return new Date(); // Return now if no schedule
        }

        const now = new Date();
        const options = { timeZone: timezone };
        let checkDate = new Date(now.toLocaleString('en-US', options));
        
        const dayMap = {
            0: 'D', 1: 'L', 2: 'M', 3: 'Me', 4: 'J', 5: 'V', 6: 'S'
        };

        // Check up to 7 days ahead
        for (let i = 0; i < 7; i++) {
            const dayAbbrev = dayMap[checkDate.getDay()];
            
            if (!schedule.days || schedule.days.includes(dayAbbrev)) {
                // This day is valid, check if we can still fit in today's schedule
                const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
                const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
                
                if (i === 0) {
                    // Today - check if current time is before end time
                    const currentMinutes = checkDate.getHours() * 60 + checkDate.getMinutes();
                    const endMinutes = endHour * 60 + endMinute;
                    
                    if (currentMinutes < endMinutes) {
                        // Can still send today
                        if (currentMinutes < startHour * 60 + startMinute) {
                            // Before start time, schedule for start
                            checkDate.setHours(startHour, startMinute, 0, 0);
                        }
                        return checkDate;
                    }
                } else {
                    // Future day - schedule for start time
                    checkDate.setHours(startHour, startMinute, 0, 0);
                    return checkDate;
                }
            }
            
            // Move to next day
            checkDate.setDate(checkDate.getDate() + 1);
            checkDate.setHours(0, 0, 0, 0);
        }

        // Fallback: return now
        return new Date();
    }
}

module.exports = new ScheduleService();

