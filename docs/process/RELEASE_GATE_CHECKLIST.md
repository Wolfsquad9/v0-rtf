# Release Gate Checklist

## Pre-Deploy (must all pass)
- [ ] Objective and acceptance criteria are explicit
- [ ] Lint passes
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Build passes
- [ ] Manual critical flow checked
- [ ] Risk + rollback documented

## Deploy Decision
- [ ] SHIP
- [ ] BLOCK
- Reason:

## Post-Deploy (first 30 minutes)
### Minute 0-5
- [ ] App boots and primary route loads
- [ ] API health checks return expected status

### Minute 5-15
- [ ] Save/load workflow works
- [ ] Error reporting channel is clean of new criticals

### Minute 15-30
- [ ] Core user flow completes end-to-end
- [ ] No elevated failure pattern observed

## Rollback Triggers
- [ ] Data corruption risk
- [ ] Auth/session failures
- [ ] Save/load failure spike
- [ ] Core flow broken

## Rollback Steps
1. Revert to previous stable deployment
2. Disable risky path if feature-flagged
3. Communicate incident + ETA
