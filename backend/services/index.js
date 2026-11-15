const { createHabitService } = require('./habitService');
const { createStatisticsService } = require('./statisticsService');
const { createAchievementService } = require('./achievementService');
const { createAnalyticsService } = require('./analyticsService');
function createServices(db) {
  const lazy = {};
  const habits = createHabitService(db, lazy);
  const statistics = createStatisticsService(db, habits);
  const achievements = createAchievementService(db, habits, statistics);
  lazy.achievements = achievements;
  const analytics = createAnalyticsService(db, habits, statistics);
  return { habits, statistics, achievements, analytics };
}
module.exports = { createServices };
