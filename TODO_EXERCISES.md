# Exercise Animations Integration TODO

## Status: In Progress

### [ ] 1. Clone dataset repo
- Fix cmd/PowerShell: `powershell -Command "if (!(Test-Path data)) { New-Item -ItemType Directory -Path data }; Set-Location data; git clone https://github.com/FitnessDB/exercise-animation-dataset.git exercises-dataset"`

### [x] 2. Explore dataset structure
- JSON format: {exerciseId, name, gifUrl, targetMuscles, instructions[]}
- Filtered 12 mental-health suitable exercises

### [x] 3. Create exercisesData.ts (static subset)
- 12 bodyweight/low-equip exercises mapped to Exercise[]

### [x] 4. Update exerciseStore.ts
- Added `animationUrl?: string` + `gifAnimation` type
- Added `loadExercises()` populates from data

### [x] 5. Update ExerciseCard.tsx
- Added 'gifAnimation' case with looping video + steps list

### [x] 6. Create ExercisesSection.tsx
- Loads store, filters physical, responsive grid with animations

### [x] 7. Update resources/page.tsx
- Added import + <ExercisesSection /> after resources grid

### [x] 8. i18n updates
- Added resources.exercises.* keys to en.json (fallbacks for others)

### [x] 9. Test
- `cd frontend && npm run dev`
- /resources shows \"Movement for Mental Clarity\" section
- Click Start: GIF plays + steps
- Complete/abandon updates status/store
- Responsive grid

### [x] 10. Optional backend
- Skipped (frontend-only persistence fine)
- Exercise model/route for persistence (skip for now)

**Next step: [1]**

