# TODO: Create Data Fetcher API for Dashboard Stats

## Tasks
- [x] Create new API endpoint `/app/api/stats/route.js` to aggregate user stats from Activity and QuizResult models
- [x] Update dashboard page to fetch from new API and display formatted stats
- [ ] Test the new API endpoint
- [ ] Verify dashboard displays stats correctly

## Details
- New API should return: Study Hours, Avg Score, Quizzes Taken, Notes Viewed, and other user-related stats
- Replace existing local calculations in dashboard with API data
- Format the stats display in dashboard
