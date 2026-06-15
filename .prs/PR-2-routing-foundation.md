# Pull Request 2: Routing Foundation

## Branch Name
`feature/routing-foundation`

## Commit Message
`feat: setup routing foundation`

## Summary
* Installed `react-router-dom` in the frontend client.
* Configured route path constants in `src/constants/routes.js`.
* Created React functional page placeholders for Login, Register, Dashboard, Users, Profile, Settings, Analytics, and NotFound in `src/pages/`.
* Created the centralized routes mapping config `AppRoutes.jsx` mapping paths to placeholder pages.
* Integrated `BrowserRouter` in `main.jsx` and injected `AppRoutes` in `App.jsx`.

## Testing
* Checked that the application builds successfully (`npm run build`).
* Checked that there are no ESLint violations (`npm run lint`).
* Application routes resolve to placeholders correctly.
