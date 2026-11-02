# Nucleus workspace refresh

The brief was to make interactions respond promptly, give Nucleus a considered visual identity, and help a student understand what to do after signing in. Existing maintenance changes were preserved on the new branch.

## The student experience

- Home recommends one next action using the student's actual material and progress. A new student starts with a subject, then a note and a small task. Due flashcards take priority; finishing a task suggests making a recall question.
- Notes, tasks, documents, and flashcards explain how to begin. The focus timer explains what it saves. Subjects consistently means a place for related material.
- The home screen puts the next action and study work ahead of analytics. Fake account details, the hard-coded streak, unsupported adoption claims, decorative glows, and delayed marketing reveals were removed.
- Recent notes open their actual editor. Creation commands also work when the destination page is already open. Review cards support keyboard activation.

## Visual direction

Nucleus uses an original N-shaped mark, Geist typography, neutral graphite workspace surfaces, and a restrained sage accent. The public page uses a light paper surface and forest-green controls. Corners, borders, text contrast, focus states, loading feedback, and reduced motion are consistent across the product.

Reference principles came from [Linear's focused workflows](https://linear.app/docs/start-guide), [Notion's contextual starting points](https://www.notion.com/help/start-with-a-template), and [Craft's document-centered presentation](https://www.craft.do/). No design-system files or styles were copied. The recall prompts follow [The Learning Scientists' guidance](https://www.learningscientists.org/blog/2016/6/23-1) to attempt retrieval before checking the answer. These are design choices, not a claim that the application has been validated in a learning-outcomes study.

## Performance work

- The public landing page no longer passes through authentication/profile middleware. It renders its content on the server, including when JavaScript is disabled; only the interactive product preview needs a client component.
- Supabase clients, verified-user checks, and workspace profile reads reuse results within a single server render using React `cache`. Student information is never cached globally across requests. Server authorization still verifies the user; existing plan gates and database access rules remain in place.
- Settings, subjects, and the active study session load together on the server. They initialize the shell directly, removing startup server actions that previously competed with clicks in the browser action queue.
- Dashboard counts share their queries with the recent-item lists. The page fetches metadata rather than entire note bodies, and fetches only pinned charts. Charts stream separately below the main study content and are omitted for an empty library.
- Navigation shows immediate pending feedback. Default prefetch behavior replaces forced prefetching of every full workspace page. Onboarding no longer inserts artificial delays between steps.
- Closed AI drawers neither load chat code nor fetch a profile. Opening them provides loading/error feedback and a keyboard-managed dialog.
- Preference controls use stable snapshots rather than mount effects, including an in-memory fallback when browser storage is unavailable. The focus timer subscribes to a clock only while running.

The regression fixture measured 21 backend requests for the original representative dashboard and 14 after this change (one third fewer), while also verifying zero browser startup server actions. The extra server-side active-session read replaces the previous client hydration request. These checks demonstrate removed work; they are not production latency or Lighthouse scores. Live latency still depends on the deployed backend, data volume, and network.

## Verification

Verified: 6 guidance tests and 11 browser tests pass, TypeScript passes, ESLint reports no errors or warnings, and the production build succeeds. The production server also returned the public pages successfully and redirected an anonymous private-page request to login.

Run:

```sh
npm test
npm run typecheck
npm run lint
npm run test:e2e
npm run build
```

The browser suite starts a separate, local Supabase HTTP fixture on port 54329 and the app on port 3100. Its fake sessions and data only exist in the test environment; production authentication has no test bypass. Tests cover slow navigation, immediate task completion, a first-study journey, note persistence, review entry, repeated creation commands, timer reload/stop, blocked browser storage, private-page redirects, and responsive layouts at 375, 768, 1024, and 1440 pixels.

Production AI generation, OAuth with a real account, and Cloudinary uploads require the existing service credentials and were not exercised against live services. Local environment files remain ignored. No database migrations were needed for this refresh.

## Screenshots

- [Landing page](screenshots/landing-desktop.png)
- [Home](screenshots/home-desktop.png)
- [Mobile landing page](screenshots/landing-mobile.png)
- [Mobile home](screenshots/home-mobile.png)
