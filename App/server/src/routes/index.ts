import express from 'express'
import { DashboardController } from '../controllers/dashboardController.js'
import { ImportController } from '../controllers/importController.js'
import { JournalController } from '../controllers/journalController.js'
import { PerformanceController } from '../controllers/performanceController.js'
import { SystemController } from '../controllers/systemController.js'
import { WeeklyReviewController } from '../controllers/weeklyReviewController.js'
import { WorkoutController } from '../controllers/workoutController.js'
import { asyncHandler } from '../middleware/errors.js'

export function createRouter() {
  const router = express.Router()
  const system = new SystemController()
  const imports = new ImportController()
  const workouts = new WorkoutController()
  const journals = new JournalController()
  const dashboard = new DashboardController()
  const performance = new PerformanceController()
  const weeklyReviews = new WeeklyReviewController()

  router.get('/health', asyncHandler(system.health.bind(system)))

  router.post('/imports/preview', asyncHandler(imports.preview.bind(imports)))
  router.post('/imports/confirm', asyncHandler(imports.confirm.bind(imports)))
  router.get('/imports', asyncHandler(imports.list.bind(imports)))
  router.get('/imports/:id', asyncHandler(imports.detail.bind(imports)))

  router.get('/workouts/inbox', asyncHandler(workouts.inbox.bind(workouts)))
  router.get('/workouts', asyncHandler(workouts.list.bind(workouts)))
  router.get('/workouts/:id', asyncHandler(workouts.detail.bind(workouts)))
  router.put('/workouts/:id/running-journal', asyncHandler(journals.saveRunning.bind(journals)))
  router.put('/workouts/:id/strength-journal', asyncHandler(journals.saveStrength.bind(journals)))
  router.put('/workouts/:id/basketball-journal', asyncHandler(journals.saveBasketball.bind(journals)))

  router.get('/dashboard/summary', asyncHandler(dashboard.summary.bind(dashboard)))

  router.get('/performance/running', asyncHandler(performance.running.bind(performance)))
  router.get('/performance/strength', asyncHandler(performance.strength.bind(performance)))
  router.get('/performance/basketball', asyncHandler(performance.basketball.bind(performance)))
  router.get('/performance/records', asyncHandler(performance.records.bind(performance)))
  router.get('/performance/trends', asyncHandler(performance.trends.bind(performance)))

  router.get('/weekly-reviews/current', asyncHandler(weeklyReviews.current.bind(weeklyReviews)))
  router.get('/weekly-reviews/:weekStart', asyncHandler(weeklyReviews.getByWeek.bind(weeklyReviews)))
  router.post('/weekly-reviews/:weekStart', asyncHandler(weeklyReviews.save.bind(weeklyReviews)))
  router.put('/weekly-reviews/:id', asyncHandler(weeklyReviews.update.bind(weeklyReviews)))

  return router
}
