# Performance Intelligence App Functional Design

## 1. App Concept

**Core philosophy:** Zepp records what happened. This app explains whether I am becoming a better athlete.

The Performance Intelligence App is a personal athletic trend analysis tool designed to work alongside Zepp and an Amazfit tracker. It is not a general health app, medical dashboard, or replacement for Zepp. Zepp remains the system of record for workouts, sleep, recovery, and daily wellness data. This app turns that data, plus manual training context, into performance-oriented trends, comparisons, and insights.

The target user is a single athlete who regularly plays basketball, runs, and lifts. The app should answer practical training questions: whether endurance is improving, whether strength work is progressing, whether basketball sessions are becoming more intense or efficient, and whether recovery habits are supporting or limiting performance.

The difference from Zepp is focus. Zepp is broad and daily. This app is narrow and longitudinal. It should care less about whether today was "healthy" and more about whether the current training block is making the user faster, stronger, more explosive, more consistent, and better recovered.

## 2. Core Goals

The app should help answer:

- Am I improving across the last few weeks and months?
- Am I training enough to make progress?
- Am I training too much relative to recovery?
- Which training type is improving most: running, strength, or basketball?
- Which area is lagging or plateauing?
- Are recovery markers improving or declining?
- Which habits, conditions, or workout combinations affect performance?
- Do heavy lifting sessions reduce basketball intensity in the following 48 hours?
- Do better sleep and lower resting heart rate correlate with better run or basketball performance?
- Am I setting personal records or drifting away from my baseline?

## 3. Main Dashboard

The dashboard should be the first screen and should function as a performance command center.

### Primary Dashboard Content

- **Overall Performance Score:** A composite score from 0-100 showing current athletic trajectory.
- **Running Trend:** Directional indicator for pace, distance, aerobic efficiency, and recent running consistency.
- **Strength Trend:** Directional indicator for weekly volume, estimated 1RM, progressive overload, and muscle balance.
- **Basketball Trend:** Directional indicator for duration, intensity, high-zone time, and session load.
- **Recovery Trend:** Directional indicator for sleep, resting heart rate, HRV if available, stress, and readiness.
- **Weekly Training Load:** Current week load compared with last week, baseline, and recommended range.
- **Recent Insight Cards:** The most important explanations generated from recent data.
- **Recommended Focus for the Week:** One clear training priority, such as "maintain running volume," "reduce lower-body fatigue," or "prioritize recovery before basketball."

### Dashboard Layout

- Top row: Overall Performance Score, weekly direction, and recommended focus.
- Second row: four compact trend cards for Running, Strength, Basketball, and Recovery.
- Third row: weekly training load chart and recent activity distribution.
- Fourth row: insight cards and next recommended action.

### Example Dashboard Insights

- "Your overall performance score is up 6 points compared with your previous 4-week average."
- "Running efficiency is improving: your Zone 2 pace is faster at a similar average heart rate."
- "Strength volume increased this week, but recovery dropped for three consecutive days."
- "Basketball intensity is highest when the previous night of sleep is above 8 hours."

## 4. Main App Pages

### Dashboard

**Purpose:** Give a quick answer to "how am I doing as an athlete right now?"

**Main data shown:** Overall score, sport trends, recovery trend, training load, recent insights, weekly focus.

**Key charts or cards:** Score ring, trend cards, training load bar chart, insight cards, weekly focus card.

**User interactions:** Change date range, open sport detail pages, expand insights, add new workout, add recovery data.

**Example insight:** "Your training load is 18% higher than last week while recovery is down 9%, so keep the next two sessions moderate."

### Running Performance

**Purpose:** Track endurance progress and running efficiency over time.

**Main data shown:** Pace, distance, duration, heart rate zones, VO2 max, cadence if available, Zone 2 efficiency, personal bests.

**Key charts or cards:** Pace trend line, weekly distance bars, heart rate zone distribution, Zone 2 efficiency chart, personal best table.

**User interactions:** Filter by run type, compare periods, view personal records, add notes about route or effort.

**Example insight:** "Your Zone 2 pace improved by 12 seconds/km over the last 6 weeks."

### Strength Training

**Purpose:** Track lifting progression, training volume, overload, and muscle group balance.

**Main data shown:** Exercise history, sets, reps, weight, estimated 1RM, weekly volume, progressive overload, muscle group distribution.

**Key charts or cards:** Volume by week, estimated 1RM trend, exercise progression table, muscle balance chart.

**User interactions:** Add workout, add exercise sets, filter by muscle group, compare current block against previous block.

**Example insight:** "Lower-body volume increased 24% this week, which may affect basketball explosiveness for the next 48 hours."

### Basketball Performance

**Purpose:** Understand basketball intensity, load, and performance readiness over time.

**Main data shown:** Session duration, average and max heart rate, high-intensity zone time, calories, training load, explosive effort estimate, weekly intensity trend.

**Key charts or cards:** Intensity trend, high-zone minutes, load per session, weekly basketball minutes, efficiency comparison.

**User interactions:** Tag session type, add perceived performance, add notes, compare games vs practice, inspect recovery before session.

**Example insight:** "Your basketball sessions are becoming more efficient because average heart rate is lower at similar duration."

### Recovery & Readiness

**Purpose:** Show whether the body is prepared for productive training.

**Main data shown:** Sleep score, sleep duration, resting heart rate, HRV if available, stress, readiness score, recovery trend.

**Key charts or cards:** Readiness trend, sleep duration chart, resting heart rate trend, HRV trend, recovery-performance correlation cards.

**User interactions:** Add daily recovery data, annotate poor sleep or stress, compare recovery against performance days.

**Example insight:** "Your best running performances happen after two nights above 8 hours of sleep."

### Training Load

**Purpose:** Prevent undertraining and overtraining by comparing current workload against baseline.

**Main data shown:** Weekly load, sport-specific load, acute load, chronic load, acute-to-chronic workload ratio, intensity distribution.

**Key charts or cards:** Load trend, sport distribution, acute vs chronic load, intensity zone split, load recommendation.

**User interactions:** Change period, inspect load by sport, view fatigue warnings, adjust subjective effort.

**Example insight:** "This week's load is 31% above your 4-week average. Maintain recovery before adding more intensity."

### Personal Records

**Purpose:** Celebrate progress and provide historical performance anchors.

**Main data shown:** Running bests, strength bests, basketball intensity records, consistency streaks.

**Key charts or cards:** PR list, recent PR alerts, distance-specific running records, estimated 1RM records, best training weeks.

**User interactions:** Filter by sport, manually add or correct PRs, open source workout.

**Example insight:** "New estimated 1RM record: squat improved from 95 kg to 100 kg."

### Weekly Review

**Purpose:** Summarize what changed this week and what to focus on next.

**Main data shown:** Overall change, best performance, weakest area, training load, recovery summary, sport-by-sport progress.

**Key charts or cards:** Weekly score delta, best session card, weakest area card, load summary, next week focus.

**User interactions:** Select week, export/share summary, mark insights as useful, add reflection notes.

**Example insight:** "Best week for consistency in the last 2 months, but recovery quality declined during the final 3 days."

### Insights / AI Coach

**Purpose:** Convert raw data into useful performance explanations and recommendations.

**Main data shown:** Improvement insights, fatigue warnings, plateau detection, PR alerts, correlations, recommendations.

**Key charts or cards:** Insight feed, impact tags, confidence labels, related workouts, trend snippets.

**User interactions:** Filter by category, dismiss insights, mark insights helpful, open supporting data.

**Example insight:** "Heavy leg workouts appear to reduce basketball intensity for the next 48 hours."

### Data Import / Settings

**Purpose:** Manage manual entry, CSV import, future integrations, units, scoring preferences, and personal baselines.

**Main data shown:** Import history, connected sources, data quality, units, baseline settings.

**Key charts or cards:** Data source status, missing data warnings, import preview, mapping table.

**User interactions:** Add manual data, upload CSV, map fields, set units, edit baseline periods.

**Example insight:** "HRV is missing for 9 of the last 14 days, so recovery score confidence is lower."

## 5. Performance Metrics

### Running Metrics

- Pace trends by run and by rolling average
- Distance per run and weekly distance
- Duration
- Average heart rate
- Max heart rate
- Heart rate zone distribution
- VO2 max from Zepp or manual import
- Cadence if available
- Zone 2 efficiency: pace at Zone 2 heart rate
- Personal bests by distance and time
- Running consistency

### Strength Metrics

- Exercise history
- Sets, reps, and weight
- Estimated 1RM
- Total weekly volume
- Volume by exercise
- Volume by muscle group
- Progressive overload trend
- Training frequency
- Muscle group balance
- Session RPE if manually entered

### Basketball Metrics

- Session duration
- Average heart rate
- Max heart rate
- Time in high-intensity zones
- Calories
- Training load
- Session RPE
- Game or practice tag
- Sprint or explosive effort estimates if available from cadence, heart rate spikes, or future wearable data
- Weekly basketball intensity trend

### Recovery Metrics

- Sleep score
- Sleep duration
- Resting heart rate
- HRV if available
- Stress
- Readiness score
- Recovery trend
- Subjective soreness
- Subjective energy
- Notes about travel, illness, alcohol, or unusual stress

## 6. Custom Performance Scores

All scores should use a 0-100 scale and compare recent performance against personal baseline, recent trend, and all-time bests. Scores should be interpreted as personal trajectory indicators, not universal fitness ratings.

### Overall Performance

Uses endurance, strength, explosiveness, work capacity, recovery, and consistency scores. It answers whether overall athletic direction is improving.

Interpretation:

- 80-100: Strong positive trend
- 60-79: Productive and stable
- 40-59: Maintenance or mixed signals
- 20-39: Declining or under-recovered
- 0-19: Major drop from baseline or insufficient data

### Endurance

Uses running pace trend, Zone 2 efficiency, weekly distance, heart rate response, VO2 max, and consistency.

### Strength

Uses estimated 1RM trend, weekly volume, progressive overload, training frequency, and exercise consistency.

### Explosiveness

Uses basketball high-intensity time, max heart rate efforts, sprint or explosive estimates, lower-body strength progress, and subjective basketball performance.

### Work Capacity

Uses weekly training load, total active minutes, ability to handle mixed sport demands, and intensity distribution.

### Recovery

Uses sleep score, sleep duration, resting heart rate, HRV, stress, readiness, and recovery trend.

### Consistency

Uses completed sessions, weekly training rhythm, missed planned sessions, and balanced distribution across running, strength, and basketball.

## 7. Trend Analysis

The app should make comparisons at several useful time scales:

- **This week vs last week:** Best for short-term load, fatigue, and consistency.
- **This month vs last month:** Best for training block progress.
- **Current 4-week average vs previous 4-week average:** Best for meaningful performance trends.
- **Current performance vs all-time personal best:** Best for motivation and peak comparison.
- **Current performance vs personal baseline:** Best for realistic status and progress assessment.

Trend outputs should avoid overreacting to one session. The default should favor rolling averages, recent consistency, and confidence levels based on available data.

## 8. Insight Engine

The insight engine should translate raw metrics into explanations. Each insight should include:

- Title
- Plain-language explanation
- Related metric or score
- Time period
- Confidence level
- Supporting data
- Suggested action
- Sport or category
- Optional "why this matters" detail

### Insight Categories

- **Improvement insights:** Highlight measurable progress.
- **Fatigue warnings:** Detect rising load with falling recovery.
- **Plateau detection:** Identify stagnant metrics over several weeks.
- **Personal record alerts:** Celebrate new bests.
- **Recovery-performance correlations:** Find links between sleep, HRV, stress, and performance.
- **Sport-specific recommendations:** Suggest practical next steps for running, strength, or basketball.

### Example Insights

- "Your Zone 2 pace improved by 12 seconds/km over the last 6 weeks."
- "Your basketball sessions are becoming more efficient because your average heart rate is lower at similar duration."
- "Your strength volume increased, but recovery dropped this week."
- "Your best running performances happen after two nights of sleep above 8 hours."
- "Heavy leg workouts appear to reduce basketball intensity for the next 48 hours."
- "You have not improved estimated squat 1RM in 5 weeks, but weekly lower-body volume has also dropped."
- "Your current weekly training load is 28% above your baseline. Keep intensity controlled until recovery rebounds."

## 9. Weekly Performance Report

The weekly report should feel like a personal coaching review.

### Report Sections

- Overall performance change
- Best performance of the week
- Weakest area
- Training load summary
- Recovery summary
- Running progress
- Strength progress
- Basketball progress
- Personal records
- Key insights
- Suggested focus for next week

### Example Weekly Report Summary

"This week was a productive but demanding training week. Overall performance increased by 4 points, led by improved running efficiency and higher strength volume. Basketball intensity remained stable, but recovery declined during the final three days. Next week, keep strength volume steady and prioritize sleep before basketball sessions."

## 10. Data Model

### User

- id
- name
- preferredUnits
- timezone
- baselineStartDate
- baselineEndDate
- createdAt
- updatedAt

### WorkoutType

- id
- name
- category: running, strength, basketball, recovery, other
- defaultMetrics
- createdAt

### Workout

- id
- userId
- workoutTypeId
- date
- startTime
- durationMinutes
- source: manual, csv, appleHealth, healthConnect, zepp
- calories
- averageHeartRate
- maxHeartRate
- trainingLoad
- perceivedEffort
- notes
- createdAt
- updatedAt

### RunningSession

- id
- workoutId
- distanceKm
- paceSecondsPerKm
- elevationGain
- averageCadence
- vo2Max
- zone1Minutes
- zone2Minutes
- zone3Minutes
- zone4Minutes
- zone5Minutes
- routeName
- runType

### StrengthSession

- id
- workoutId
- totalVolume
- muscleGroups
- exercises
- sessionType
- sorenessAfter

### StrengthExerciseSet

- id
- strengthSessionId
- exerciseName
- muscleGroup
- setNumber
- reps
- weight
- rpe
- estimatedOneRepMax

### BasketballSession

- id
- workoutId
- sessionType: game, pickup, practice, shooting, conditioning
- highIntensityMinutes
- explosiveEffortEstimate
- averageIntensity
- perceivedPerformance
- courtTimeMinutes
- notes

### RecoveryMetric

- id
- userId
- date
- sleepScore
- sleepDurationMinutes
- restingHeartRate
- hrv
- stressScore
- readinessScore
- soreness
- energy
- notes
- source

### DailyMetric

- id
- userId
- date
- steps
- activeCalories
- totalCalories
- restingHeartRate
- stressScore
- source

### PersonalRecord

- id
- userId
- category
- metricName
- value
- unit
- date
- workoutId
- previousValue
- notes

### PerformanceScore

- id
- userId
- date
- period: daily, weekly, monthly
- overall
- endurance
- strength
- explosiveness
- workCapacity
- recovery
- consistency
- confidence
- inputsSummary

### Insight

- id
- userId
- createdAt
- category
- title
- message
- relatedMetric
- relatedWorkoutId
- periodStart
- periodEnd
- confidence
- suggestedAction
- status: active, dismissed, saved

### WeeklyReport

- id
- userId
- weekStart
- weekEnd
- overallChange
- bestPerformance
- weakestArea
- trainingLoadSummary
- recoverySummary
- runningSummary
- strengthSummary
- basketballSummary
- suggestedFocus
- insightIds
- createdAt

## 11. Data Input

### Phase 1: Manual Data Entry

Start with manual entry for workouts and recovery. This makes the MVP independent of Zepp API access and lets the app prove the scoring and insight model first.

Manual entry should support:

- Running workout
- Strength workout with exercises and sets
- Basketball session
- Daily recovery metrics
- Personal notes

### Phase 2: CSV Import

Support CSV imports from exported Zepp, Apple Health, Google Fit, or manually maintained spreadsheets.

CSV import should include:

- File upload
- Column mapping
- Import preview
- Validation warnings
- Duplicate detection
- Import history

### Phase 3: Apple Health, Google Health Connect, Or Other Sources

Add integrations for broader data access where possible. Prioritize stable sources with good export or API support.

### Phase 4: Zepp/Amazfit Integration

Explore direct Zepp or Amazfit integration only if a stable and acceptable path exists. Treat this as optional because direct API availability may be limited.

## 12. MVP Scope

### MVP Features

- Manual workout entry
- Manual recovery entry
- Dashboard
- Running trends
- Strength trends
- Basketball session tracking
- Weekly report
- Basic insight cards
- Personal records
- Local data persistence
- Basic score calculation

### Save For Later

- Direct Zepp integration
- Apple Health or Health Connect integration
- CSV import automation
- Advanced AI coach
- Predictive fatigue modeling
- Calendar planning
- Workout recommendations by training block
- Social sharing
- Multi-user support
- Medical interpretations
- Nutrition tracking

## 13. User Flows

### Add A Running Workout

1. Open Add Workout.
2. Select Running.
3. Enter date, duration, distance, pace, heart rate, zones, VO2 max, cadence, and notes.
4. Save workout.
5. App updates running trend, endurance score, personal records, and insights.

### Add A Strength Workout

1. Open Add Workout.
2. Select Strength.
3. Add exercises, sets, reps, weight, and RPE.
4. Tag muscle groups.
5. Save workout.
6. App updates volume, estimated 1RM, strength score, muscle balance, and overload insights.

### Add A Basketball Session

1. Open Add Workout.
2. Select Basketball.
3. Enter date, duration, average heart rate, max heart rate, high-intensity minutes, calories, session type, perceived performance, and notes.
4. Save session.
5. App updates basketball trend, explosiveness score, load, and recovery correlations.

### Add Daily Recovery Data

1. Open Recovery Entry.
2. Enter sleep duration, sleep score, resting heart rate, HRV if available, stress, soreness, energy, and notes.
3. Save recovery data.
4. App updates recovery score, readiness trend, and correlation insights.

### View Dashboard

1. Open app.
2. Review overall score and weekly focus.
3. Scan sport trends and recovery trend.
4. Open the most important insight or sport detail page.

### View Weekly Report

1. Open Weekly Review.
2. Select current or previous week.
3. Read performance summary, best session, weakest area, and next focus.
4. Add reflection notes if desired.

### Check Personal Records

1. Open Personal Records.
2. Filter by running, strength, basketball, or consistency.
3. Open a record to see the source workout and previous best.

### Read Insights

1. Open Insights / AI Coach.
2. Filter by improvement, fatigue, plateau, PR, recovery, or sport.
3. Expand an insight to view supporting data.
4. Mark insight helpful, save it, or dismiss it.

## 14. UI/UX Direction

The app should feel athletic, clean, data-focused, motivating, and personal. It should feel more like a performance lab than a medical app.

### Visual Style

- Dark or neutral base with high-contrast data accents.
- Crisp typography with compact dashboard density.
- Color meaning should be consistent: green for improvement, amber for caution, red for overload, blue for endurance, graphite or white for neutral structure.
- Avoid medical styling, hospital colors, and wellness-app softness.
- Use precise labels and short explanations.

### Layout Ideas

- Mobile-first bottom navigation for Dashboard, Log, Insights, Reports, and Settings.
- Desktop layout with left navigation and wider chart panels.
- Dashboard cards should be scannable and compact.
- Sport pages should use tabs for Overview, Trends, Records, and Sessions.
- Add-workout flow should be fast, with sport-specific forms.

### Card Types

- Score cards
- Trend cards
- Insight cards
- Warning cards
- Personal record cards
- Weekly summary cards
- Data quality cards

### Chart Types

- Line charts for trends
- Bar charts for weekly volume and load
- Stacked bars for heart rate zones
- Radar or balance chart for muscle groups
- Small sparklines inside summary cards
- Calendar heatmap for consistency

### Mobile Considerations

- Prioritize summary first, details second.
- Keep add-workout actions one thumb away.
- Use progressive disclosure for charts.
- Avoid dense tables on mobile; use grouped cards instead.
- Make weekly report readable as a vertical story.

## 15. Technical Recommendations

### Recommended Stack

- Vue 3
- TypeScript
- Vue Router
- Pinia
- ECharts or Chart.js
- Local storage or IndexedDB for MVP
- Supabase later if cloud sync, auth, or multi-device access becomes important

### Data Persistence Approach

For the MVP, use IndexedDB through a wrapper such as Dexie. It is better than local storage for structured workout history, nested strength sets, imports, and future migration. Local storage can be used only for lightweight preferences.

If cloud sync becomes important, migrate persistence to Supabase with row-level security and a single-user auth model.

### Suggested Folder Structure

```text
src/
  app/
    router/
    layouts/
  components/
    charts/
    dashboard/
    forms/
    insights/
    records/
    scores/
    shared/
  pages/
    DashboardPage.vue
    RunningPerformancePage.vue
    StrengthTrainingPage.vue
    BasketballPerformancePage.vue
    RecoveryReadinessPage.vue
    TrainingLoadPage.vue
    PersonalRecordsPage.vue
    WeeklyReviewPage.vue
    InsightsPage.vue
    SettingsImportPage.vue
  stores/
    workoutStore.ts
    recoveryStore.ts
    scoreStore.ts
    insightStore.ts
    settingsStore.ts
  services/
    scoringService.ts
    insightService.ts
    trendService.ts
    personalRecordService.ts
    importService.ts
    persistenceService.ts
  types/
    workout.ts
    recovery.ts
    scores.ts
    insights.ts
    reports.ts
  utils/
    dateRanges.ts
    units.ts
    calculations.ts
```

### Main Components

- `PerformanceScoreCard`
- `TrendCard`
- `TrainingLoadChart`
- `HeartRateZoneChart`
- `WeeklyFocusCard`
- `InsightCard`
- `WorkoutEntryForm`
- `RecoveryEntryForm`
- `StrengthExerciseEditor`
- `PersonalRecordList`
- `WeeklyReportSummary`
- `DateRangeSelector`

### Pinia Stores

- `workoutStore`: workouts, sport-specific sessions, workout creation and updates.
- `recoveryStore`: daily recovery entries and readiness data.
- `scoreStore`: calculated performance scores by period.
- `insightStore`: generated insight cards and insight status.
- `settingsStore`: units, baselines, source settings, feature flags.

### Services

- `scoringService`: calculates all custom scores.
- `trendService`: compares periods and rolling averages.
- `insightService`: generates insight cards from scoring and trend outputs.
- `personalRecordService`: detects and stores PRs.
- `importService`: handles CSV parsing and field mapping in later phases.
- `persistenceService`: abstracts IndexedDB now and future Supabase later.

### Example Routes

- `/`
- `/running`
- `/strength`
- `/basketball`
- `/recovery`
- `/training-load`
- `/records`
- `/weekly-review`
- `/insights`
- `/settings/import`
- `/log/workout`
- `/log/recovery`

## 16. Final Deliverable

### Concise App Summary

The Performance Intelligence App is a personal athletic analysis tool that sits beside Zepp. Zepp captures activity, recovery, and health data. This app converts that data into performance trends, personal comparisons, training load context, and practical insights for running, strength training, basketball, and recovery.

### MVP Feature List

- Manual running workout entry
- Manual strength workout entry
- Manual basketball session entry
- Manual daily recovery entry
- Dashboard with performance overview
- Running trend page
- Strength trend page
- Basketball tracking page
- Recovery and readiness page
- Weekly performance report
- Personal records
- Basic insight cards
- Local persistence with IndexedDB

### Recommended Page Structure

- Dashboard
- Running Performance
- Strength Training
- Basketball Performance
- Recovery & Readiness
- Training Load
- Personal Records
- Weekly Review
- Insights / AI Coach
- Data Import / Settings

### Core Data Model

The core entities are:

- User
- WorkoutType
- Workout
- RunningSession
- StrengthSession
- StrengthExerciseSet
- BasketballSession
- RecoveryMetric
- DailyMetric
- PersonalRecord
- PerformanceScore
- Insight
- WeeklyReport

### First 10 Development Tasks

1. Scaffold the Vue 3 + TypeScript app with Vue Router and Pinia.
2. Define TypeScript models for workouts, recovery metrics, scores, insights, and weekly reports.
3. Add IndexedDB persistence through a dedicated persistence service.
4. Build the main app shell with navigation and responsive layout.
5. Implement manual workout entry for running, strength, and basketball.
6. Implement manual daily recovery entry.
7. Build basic trend calculations for weekly and 4-week comparisons.
8. Build the dashboard with score cards, sport trends, training load, and recent insights.
9. Implement personal record detection for running and strength.
10. Build the first weekly report view with summaries, score changes, best performance, weakest area, and suggested focus.
