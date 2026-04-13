# Deploy Risk Gate

Use before any deploy to surface risks that may block or warn.

## Step 1: Read active risks

Read `docs/8hour/risks/active.md`. Parse each H2 block; extract `severity`.

## Step 2: Classify

- Risks with severity ≥`severity_threshold_block` (default 20) → **BLOCKER**
- Risks with severity in [`severity_threshold_warn`, `severity_threshold_block` - 1] → **WARN**
- Lower → ignore for the gate

## Step 3: Report

If any **BLOCKER**:

```
🚫 Deploy blocked by 1+ critical risk(s):

1. <title> (severity <S>) — owner @<owner>, due <date>
   <mitigation status>

To override: pass --accept-risk-<id> for each risk above.
```

If only **WARN**:

```
⚠️  Deploy proceeding with 2 warning(s):

1. <title> (severity <S>) — owner @<owner>
2. <title> (severity <S>) — owner @<owner>
```

If neither:

```
✅ No blocking risks active. Proceed with deploy.
```

## Step 4: Return status to caller

This prompt does NOT actually block — it returns structured data the `deploy` module can act on. Exit code 0 = OK, 1 = WARN, 2 = BLOCKER. The deploy module decides what to do with the signal.

## Step 5: Update 8HOUR.md (optional)

If the gate was triggered (warn or blocker), append to Decision Log:
`- YYYY-MM-DD — Deploy gate: <STATUS> (<N> issues)`
