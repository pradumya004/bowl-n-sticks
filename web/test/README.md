# Action tests

Runs the real server actions in `lib/actions/` against a fake Supabase client
that records every query they build. No database, no network, no Next runtime.

```bash
cd web
node --experimental-loader ./test/loader.mjs test/run.mjs    # options
node --experimental-loader ./test/loader.mjs test/run2.mjs   # items + sections
node --experimental-loader ./test/loader.mjs test/run3.mjs   # reordering
```

## What this is actually for

These catch the class of bug that does not throw. Supabase returns
`{ data, error }` instead of raising, so dropping an `error` check or a
`.select("id")` guard turns a failed write into a silent success. Every action
here is asserted on three things: the query it builds, what it returns on
failure, and whether it refreshes the public menu.

`loader.mjs` resolves the app's `@/` alias and swaps `@/lib/supabase/server`,
`@/lib/debug` and `next/cache` for the stubs, so the action code under test is
byte-for-byte the shipped code.

No test runner on purpose: adding Jest or Vitest to a Next app for three files
costs more than it returns.
