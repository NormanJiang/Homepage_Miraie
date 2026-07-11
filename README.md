# Miraie Homepage

Static personal homepage for `norman-jiang.com`. The site is built with Vite and includes the Payroll dashboard as the `/payroll/` static route.

## Local development

```powershell
$pnpm = "C:\\Users\\user\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\bin\\fallback\\pnpm.cmd"
& $pnpm install
& $pnpm --dir payroll-hours-dashboard build
& $pnpm sync:payroll
& $pnpm dev
```

Open the local URL printed by Vite. The Payroll card opens `/payroll/` in the production build.

## Production build

```powershell
$pnpm = "C:\\Users\\user\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\bin\\fallback\\pnpm.cmd"
& $pnpm --dir payroll-hours-dashboard build
& $pnpm sync:payroll
& $pnpm build
```

Deploy the root `dist` folder to GitHub Pages. The main site is at `/` and the Payroll dashboard is included at `/payroll/`. The repository includes a GitHub Actions workflow that builds and deploys it on every push to `main`.

## Add a future page

1. Add the new static project as a sibling folder.
2. Add a sync script that copies its static build output into `public/<page-name>/`.
3. Add a card to `src/main.js` that links to `./<page-name>/`.
