# My Performance Journal Functional Design

## Product Vision

My Performance Journal is an athletic diary that extends Zepp.

It is not another fitness tracker. It is not a Zepp replacement. Zepp remains the place where objective activity, sleep, heart rate, calories, workout recording, and recovery data are captured. My Performance Journal adds the context Zepp can never know: why the workout happened, what was trained, how it felt, what the athlete was trying to improve, what was learned, and how those lessons compound over time.

Performance Intelligence is the engine inside the app. It powers analysis, insights, and connections between objective Zepp data and subjective journal context. The product itself is the athlete's diary.

The product should answer questions like:

- Am I becoming a better runner?
- Is my basketball improving?
- Am I progressively overloading in the gym?
- Which workouts actually improve my performance?
- What type of running benefits me most?
- How does sleep affect different kinds of workouts?
- How consistent am I with my training?

The product promise is simple:

> Zepp records what happened. Performance Intelligence explains what it meant. My Performance Journal preserves the story.

## Product Role

### Zepp Is Responsible For

- Activity
- Sleep
- Heart rate
- Calories
- Workout recording
- Recovery and BioCharge-style readiness signals

### My Performance Journal Is Responsible For

- Training context
- Workout enrichment
- Training journal entries
- Sport-specific performance analysis
- Weekly reflection
- Long-term trends
- Personal insights
- Searchable athletic history

My Performance Journal should never recreate Zepp's health features. Health data is used only as context for performance analysis.

## Core User Journey

The main journey is:

1. Import Zepp data.
2. Review imported workouts.
3. Enrich workouts with sport-specific details.
4. Generate meaningful performance insights.
5. Reflect through weekly reviews.
6. Build a searchable history of athletic development.

This creates the central loop:

**Objective data -> subjective context -> performance meaning -> better decisions.**

## Product Model

Every workout has three layers.

### Objective Layer

This comes from Zepp and should remain separate from user-entered context.

Examples:

- Date
- Start time
- Duration
- Distance
- Pace
- Heart rate
- Calories
- Training load
- Sleep and recovery context near the workout

### Enrichment Layer

This comes from the athlete.

Examples:

- Why the workout happened
- What was trained
- How hard it felt
- How well the athlete performed
- What role or purpose the workout served
- Notes and lessons

### Meaning Layer

This is what the Performance Intelligence engine produces by combining objective data and enrichment.

Examples:

- "Easy runs after better sleep are improving."
- "Basketball sessions feel worse after heavy lower-body lifting."
- "Strength volume is increasing, but perceived performance is flat."
- "Tempo runs seem to transfer better than short intervals right now."

## Workout Enrichment

Workout enrichment is a first-class product concept. Imported workouts are useful, but enriched workouts are meaningful.

An imported workout should initially be treated as incomplete until the athlete reviews it and adds the missing context.

### Running Enrichment

Running workouts should support:

- Training purpose
- Perceived effort
- Perceived performance
- Route type
- Notes

Example training purposes:

- Easy aerobic
- Zone 2
- Tempo
- Intervals
- Long run
- Recovery run
- Test effort
- Race

Example route types:

- Flat
- Hills
- Trail
- Track
- Treadmill
- Mixed

The purpose of running enrichment is to explain which kinds of runs are improving fitness, speed, endurance, or recovery.

### Strength Enrichment

Strength workouts should support:

- Exercises
- Sets
- Reps
- Weight
- RPE
- Notes

The purpose of strength enrichment is to understand progressive overload, exercise progression, fatigue, and transfer to basketball or running.

Strength analysis should care less about generic workout completion and more about whether the athlete is gradually doing more useful work over time.

### Basketball Enrichment

Basketball workouts should support:

- Session type
- Perceived performance
- Perceived effort
- Energy
- Explosiveness
- Shooting
- Defense
- Role
- Notes

Example session types:

- Game
- Pickup
- Team practice
- Skills session
- Shooting session
- Conditioning

Example roles:

- Primary scorer
- Facilitator
- Defender
- Off-ball
- Mixed

The purpose of basketball enrichment is to capture qualitative performance that Zepp cannot measure directly.

## Workout Inbox

The Workout Inbox is where imported workouts become journal entries.

Every imported workout should initially require review. The inbox exists because imported sensor data is incomplete without athlete context.

### Inbox Examples

- Running workout: needs training purpose.
- Strength workout: needs exercises.
- Basketball workout: needs qualitative notes.

### Inbox Statuses

Suggested statuses:

- Needs review
- Needs purpose
- Needs exercises
- Needs performance notes
- Reviewed
- Ignored

The goal is not to force perfect data entry. The goal is to help the athlete add enough meaning for future analysis.

## Main Pages

The app should be organized around athlete workflows, not raw data categories.

Recommended pages:

- Dashboard
- Workout Inbox
- Workout Details
- Performance
- Weekly Review
- Health Context
- Settings

## Dashboard

### Purpose

The Dashboard should answer questions, not display a pile of metrics.

It should help the athlete quickly understand:

- What happened this week?
- How am I progressing?
- What needs my attention?
- What did I learn?
- What should I do next?

### User Goals

- Get a quick sense of the current training week.
- See whether performance is improving, declining, or unclear.
- Find workouts that still need enrichment.
- Read recent insights.
- Decide what deserves attention next.

### Primary Interactions

- Open workouts needing enrichment.
- Read weekly summary cards.
- Open a recent insight.
- Jump to Performance for trend exploration.
- Start or continue the weekly review.

### Key Information Shown

- Weekly summary
- Progress cards
- Workouts needing enrichment
- Recent insights
- Upcoming recommendations
- Recent lessons from the journal

### Empty States

If there is no imported data:

- Explain that the app starts by importing Zepp data.
- Invite the athlete to import a Zepp export.
- Clarify that My Performance Journal does not replace Zepp recording.

If there are imported workouts but no enrichment:

- Show that objective data exists.
- Explain that insights become more useful after workout review.
- Send the athlete to the Workout Inbox.

### Future Opportunities

- Personalized weekly focus
- "Most useful workout this month"
- Consistency streaks
- Training pattern alerts
- Journal lesson highlights

## Workout Inbox

### Purpose

The Workout Inbox turns imported Zepp workouts into reviewed training journal entries.

### User Goals

- See which workouts need attention.
- Add the minimum useful context quickly.
- Correct or ignore workouts that are not useful.
- Keep the journal clean without heavy manual entry.

### Primary Interactions

- Filter by sport.
- Filter by review status.
- Open a workout detail page.
- Add missing enrichment fields.
- Mark a workout as reviewed.
- Ignore low-value or irrelevant workouts.

### Key Information Shown

- Sport type
- Date and duration
- Objective Zepp summary
- Missing enrichment fields
- Review status
- Quick reason the workout needs attention

### Empty States

If there are no imported workouts:

- Prompt the athlete to import Zepp data.

If every workout is reviewed:

- Celebrate that the journal is up to date.
- Suggest reviewing Performance or Weekly Review.

### Future Opportunities

- Smart grouping by week
- Suggested running purpose from pace and heart rate
- Suggested basketball session type from duration and intensity
- Bulk review for low-priority workouts

## Workout Details

### Purpose

Workout Details should tell the complete story of one workout.

It should preserve the difference between what Zepp observed and what the athlete experienced.

### User Goals

- Review objective workout facts.
- Add or edit sport-specific context.
- Record what was learned.
- Understand how this workout affects long-term performance.

### Primary Interactions

- Edit enrichment fields.
- Add notes.
- Add strength exercises.
- Update perceived effort and performance.
- Review nearby health context.
- Open related insights or similar workouts.

### Key Information Shown

- Objective Zepp summary
- Sport-specific enrichment form
- Notes and lessons
- Sleep and recovery context near the workout
- Related performance insights
- Source and review status

### Empty States

If the workout has not been enriched:

- Show the objective data first.
- Explain which context is missing.
- Offer the shortest useful enrichment path.

If objective data is incomplete:

- Show what was imported.
- Allow the athlete to enrich what is known.
- Avoid pretending missing Zepp facts are available.

### Future Opportunities

- Compare with similar workouts
- Show previous workout of the same type
- Attach media or external notes
- Add custom tags
- Track lessons learned over time

## Performance

### Purpose

Performance is where trends are explored.

It should combine objective Zepp data with manual workout enrichment to explain progress across running, strength, and basketball.

### User Goals

- Explore whether each sport is improving.
- Understand which workout types are helping.
- See records and long-term patterns.
- Connect performance changes to sleep, recovery, and training context.

### Primary Interactions

- Switch between Running, Strength, Basketball, Records, and Trends.
- Filter by time range.
- Open source workouts behind a trend.
- Compare enriched workout types.
- Review records and meaningful changes.

### Key Information Shown

#### Running

- Pace trends by training purpose
- Distance and consistency trends
- Perceived performance vs objective pace
- Route context
- Sleep and recovery impact on run quality

#### Strength

- Exercise progression
- Weekly volume
- Estimated strength improvements
- RPE trends
- Progressive overload patterns
- Carryover or fatigue effects on basketball and running

#### Basketball

- Session type trends
- Perceived performance
- Effort, energy, explosiveness, shooting, and defense trends
- Role patterns
- Sleep and recovery impact on basketball quality

#### Records

- Running bests
- Strength bests
- Basketball high-performance sessions
- Best training weeks
- Meaningful consistency records

#### Trends

- Cross-sport patterns
- Training consistency
- Recovery-sensitive performance
- Workout types that appear most beneficial
- Workouts or patterns associated with declines

### Empty States

If there is imported data but not enough enrichment:

- Explain that trend analysis needs reviewed workouts.
- Show which sport needs the most context.
- Link to the Workout Inbox.

If there is not enough historical data:

- Show the current baseline.
- Explain what will become visible over time.

### Future Opportunities

- Training block comparison
- Goal-specific trend views
- Plateau detection
- Best workout type recommendations
- Sport-specific performance timelines

## Weekly Review

### Purpose

Weekly Review should make reflection a habit.

It should not simply summarize numbers. It should help the athlete understand what improved, what declined, which patterns appeared, and what should change next week.

### User Goals

- Understand the week as a training story.
- Identify what worked.
- Notice what declined or felt off.
- Save lessons learned.
- Choose a focus for next week.

### Primary Interactions

- Read generated weekly reflection.
- Answer reflection prompts.
- Save weekly lessons.
- Choose next-week focus.
- Open important workouts from the week.

### Key Information Shown

- What improved
- What declined
- Training patterns
- Sport distribution
- Consistency
- Recovery context
- Best workout
- Most informative workout
- Recommended next-week adjustment
- Three actionable insight cards

### Reflection Prompts

Examples:

- What workout felt most useful this week?
- What felt harder than expected?
- What should I repeat next week?
- What should I avoid or reduce?
- What did I learn about my body or performance?

### Empty States

If there are not enough workouts:

- Encourage a lightweight reflection anyway.
- Let the athlete record lessons manually.

If workouts are imported but not enriched:

- Explain that weekly review improves after workout context is added.
- Link to the Workout Inbox.

### Future Opportunities

- Monthly review rollups
- Training block summaries
- Recurring lessons
- Focus tracking across weeks
- Coach-style reflection prompts

## Health Context

### Purpose

Health Context should show Zepp health data only as background for performance.

This page should not become a medical dashboard or Zepp clone.

### User Goals

- Understand how sleep, heart rate, recovery, and activity may have influenced training.
- See whether certain health patterns align with better or worse workouts.
- Review context without treating it as the main product.

### Primary Interactions

- Inspect health context around workouts.
- Compare sleep and recovery against enriched performance ratings.
- Open workouts affected by unusually good or poor health context.

### Key Information Shown

- Sleep duration and quality context
- Resting heart rate context
- Recovery or BioCharge-style context from Zepp
- Daily activity context
- Workouts linked to each context pattern

### Empty States

If no health data has been imported:

- Explain that Zepp remains the source of health data.
- Invite the athlete to import sleep, heart rate, and daily activity files.

If health data exists but no workouts are enriched:

- Explain that context becomes meaningful when connected to workout experience.

### Future Opportunities

- Best performance after sleep patterns
- Recovery-sensitive recommendations
- Sport-specific sleep impact
- Weekly review context cards

## Settings

### Purpose

Settings should support data import, data management, preferences, and journal setup.

### User Goals

- Import Zepp exports.
- Preview detected data before saving.
- Review import history.
- Manage local data.
- Adjust personal preferences.

### Primary Interactions

- Import CSV, JSON, or Zepp export files.
- Preview detected data types.
- Confirm import.
- Review import errors.
- Review duplicate detection.
- Manage local app data.

### Key Information Shown

- Import status
- Import history
- Detected data types
- Duplicate warnings
- Unsupported files
- Data coverage
- App preferences

### Empty States

If no imports exist:

- Explain the import-first workflow.
- Clarify that Zepp remains the source of objective data.
- Provide a simple path to begin.

### Future Opportunities

- Backup and export
- Custom sport labels
- Goal setup
- Journal archive export
- Richer import diagnostics

## Searchable Athletic History

Over time, the app should become a searchable personal history of athletic development.

The athlete should be able to find:

- Best runs by purpose
- Strength sessions that led to progress
- Basketball sessions that felt great or poor
- Workouts after bad sleep
- Notes about injuries, fatigue, or breakthroughs
- Lessons from previous training blocks

Search should prioritize meaning, not only dates and numbers.

Example searches:

- "best tempo runs"
- "basketball after poor sleep"
- "heavy legs"
- "good shooting days"
- "squat progress"
- "runs that felt easy"

## Insight Philosophy

Insights should explain performance, not merely report metrics.

Weak insight:

- "You ran 12 km this week."

Strong insight:

- "Your easy runs are becoming faster at similar effort, which suggests aerobic progress."

Weak insight:

- "You played basketball for 90 minutes."

Strong insight:

- "Your basketball performance rating was highest after rest days and lower after heavy lower-body lifting."

Insights should combine:

- Objective Zepp data
- Enriched workout context
- Time trends
- Weekly reflection
- Personal history

## MVP Scope

The MVP should focus on the core journal loop.

### Include

- Zepp data import
- Workout Inbox
- Workout Details
- Sport-specific enrichment
- Dashboard focused on questions
- Performance page with running, strength, basketball, records, and trends
- Health Context page
- Weekly Review
- Import history
- Local persistence

### Keep Secondary

- Manual workout entry as a fallback for missing Zepp workouts
- Manual recovery entry as a fallback for missing context

### Exclude For Now

- Authentication
- Backend sync
- Social features
- Medical interpretation
- Direct Zepp API integration
- AI chat
- Prediction engines
- Complex coaching automation

## Product Principles

- Zepp records what happened.
- Performance Intelligence explains what it meant.
- My Performance Journal preserves the story.
- Objective and subjective data remain separate.
- The app extends Zepp; it does not replace Zepp.
- The athlete should spend more time reflecting than entering data.
- Every feature should help explain performance, not simply display metrics.
- When unsure about a feature, ask: does this help tell the story of training, or is it just another graph?
- If it is just another graph, Zepp probably already does that well.
- Imported workouts should become journal entries, not just database rows.
- Enrichment should be lightweight but valuable.
- Manual entry is a fallback; workout enrichment is the core behavior.
- Health data is context, not the product's main purpose.
- The app should reward consistency, curiosity, and honest reflection.
- Long-term insight matters more than daily noise.
- The product should feel personal, athletic, clean, and motivating.
