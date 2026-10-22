# Lily Guard

Android-first React Native app that blocks incoming cellular calls using configurable number rules while keeping the system Phone app as the dialer

## Implemented MVP

- Android `CallScreeningService`; the app does not replace the default Phone app.
- User-controlled `starts with`, `ends with`, `contains`, exact-number and country-code rules.
- Searchable worldwide country selector with ISO and international calling codes.
- Default enabled `140` promotional-call rule.
- Local native persistence, so screening does not depend on React Native or a network request during a call.
- Automatic SIM-country detection with country-wide blocking protection for the detected home country.
- Master protection switch and individual rule switches.
- Native Android Call Screening role request.
- Fail-open handling: invalid configuration or an unknown number never blocks a call.
- Emergency short-code allow-list.

Live screening currently targets Android 10 or newer. iOS does not support dynamic prefix, suffix or contains matching through Call Directory extensions
