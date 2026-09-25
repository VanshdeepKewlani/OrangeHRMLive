# OrangeHRM Employee Lifecycle Automation

Playwright and TypeScript automation for the OrangeHRM employee lifecycle assessment.

## Coverage

The end-to-end test covers:

- Login with configurable credentials.
- Add an employee from JSON data, including profile-picture upload.
- Search and edit job title and employment status.
- Cross-check employee creation and updates through the authenticated OrangeHRM API.
- Delete the employee and verify removal in both UI and API.
- Logout and verify that the protected dashboard redirects to login.

## Prerequisites

- Node.js 20 or newer.
- Access to `https://opensource-demo.orangehrmlive.com`.

## Setup

```powershell
npm install
npx playwright install chromium
```

The default credentials are the assessment credentials (`Admin` / `admin123`). Override them when needed:

```powershell
$env:ORANGEHRM_USERNAME = 'Admin'
$env:ORANGEHRM_PASSWORD = 'admin123'
$env:BASE_URL = 'https://opensource-demo.orangehrmlive.com'
```

## Run

```powershell
npm test
```

Useful commands:

```powershell
npm run test:headed
npm run test:debug
npm run typecheck
npm run report
```

The test uses one worker because the employee lifecycle is stateful. Each run creates a unique employee ID from `test-data/employee.json`.

## Framework structure

```text
src/
	api/OrangeHrmApi.ts       Authenticated API verification
	models/employee.ts        Shared employee contracts
	pages/LoginPage.ts        Login and logout actions
	pages/PimPage.ts          PIM employee actions and assertions
	utils/profilePicture.ts   Runtime PNG fixture generation
	utils/testData.ts         JSON data loading and unique IDs
test-data/employee.json     Data-driven employee template
tests/employee-lifecycle.spec.ts
playwright.config.ts        Browser, reporting, video, trace, and timeout policy
```

## Reports and artifacts

Playwright generates an HTML report in `playwright-report/`. Videos are recorded for every test and retained with the test results. Screenshots and traces are retained on failure.
