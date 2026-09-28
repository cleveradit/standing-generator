# Graph Report - src  (2026-09-21)

## Corpus Check
- Corpus is ~5,235 words - fits in a single context window. You may not need a graph.

## Summary
- 120 nodes · 287 edges · 8 communities (5 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Simulator presentation
- Admin workflow
- Standings and tiebreakers
- Scenario simulation
- Supabase snapshot data
- Domain types

## God Nodes (most connected - your core abstractions)
1. `getSupabaseClient()` - 12 edges
2. `Match` - 10 edges
3. `simulate()` - 10 edges
4. `calculateStandings()` - 9 edges
5. `Team` - 8 edges
6. `AdminPage()` - 8 edges
7. `SeasonSnapshot` - 7 edges
8. `resolveGroup()` - 7 edges
9. `rankStandings()` - 7 edges
10. `SimulatorPage()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `onSubmit()` --calls--> `signInAdmin()`  [EXTRACTED]
  components/admin/AdminSignInForm.tsx → services/supabase/auth.ts
- `onSubmit()` --calls--> `savePandaScoreToken()`  [EXTRACTED]
  components/admin/ProviderSettingsForm.tsx → services/supabase/provider-settings.ts
- `useScenarioSimulation()` --calls--> `simulate()`  [EXTRACTED]
  hooks/useScenarioSimulation.ts → engine/simulator.ts
- `SimulatorPage()` --calls--> `calculateStandings()`  [EXTRACTED]
  pages/SimulatorPage.tsx → engine/standings.ts
- `SimulatorPage()` --calls--> `rankStandings()`  [EXTRACTED]
  pages/SimulatorPage.tsx → engine/tiebreaker.ts

## Import Cycles
- None detected.

## Communities (8 total, 1 thin omitted)

### Community 0 - "Simulator presentation"
Cohesion: 0.15
Nodes (20): asPercentage(), ProbabilityTable(), ProbabilityTableProps, SeasonHeader(), SeasonHeaderProps, StandingsTable(), StandingsTableProps, Scoreline (+12 more)

### Community 1 - "Admin workflow"
Cohesion: 0.17
Nodes (20): AdminSignInForm(), onSubmit(), ProviderSettingsForm(), onSubmit(), AdminPage(), logout(), syncNow(), AdminState (+12 more)

### Community 2 - "Standings and tiebreakers"
Cohesion: 0.16
Nodes (16): Match, SeasonRules, TieBreakerRule, calculateStandings(), isValidFinishedMatch(), compareMetric(), Metric, metricFor() (+8 more)

### Community 3 - "Scenario simulation"
Cohesion: 0.20
Nodes (13): RemainingMatches(), RemainingMatchesProps, sameScoreline(), scorelineLabel(), createRandom(), legalScorelines(), remainingMatches(), sameScoreline() (+5 more)

### Community 4 - "Supabase snapshot data"
Cohesion: 0.20
Nodes (11): DEFAULT_SEASON_RULES, MatchStatus, getSeasonSnapshot(), SeasonApiError, EmptyActiveSeasonError, loadActiveSeasonSnapshot(), toMatch(), toRules() (+3 more)

## Knowledge Gaps
- **19 isolated node(s):** `ProbabilityTableProps`, `RemainingMatchesProps`, `SeasonHeaderProps`, `StandingsTableProps`, `teams` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 27 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseClient()` connect `Admin workflow` to `Supabase snapshot data`?**
  _High betweenness centrality (0.151) - this node is a cross-community bridge._
- **Why does `getSeasonSnapshot()` connect `Supabase snapshot data` to `Simulator presentation`, `Admin workflow`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `Match` connect `Standings and tiebreakers` to `Simulator presentation`, `Scenario simulation`, `Supabase snapshot data`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **What connects `ProbabilityTableProps`, `RemainingMatchesProps`, `SeasonHeaderProps` to the rest of the system?**
  _19 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Simulator presentation` be split into smaller, more focused modules?**
  _Cohesion score 0.14532019704433496 - nodes in this community are weakly interconnected._