# Cloudflare deployment

## Workers Static Assets — configured target

The committed `wrangler.jsonc` uses `build/` and automatic trailing-slash handling. Entry pages have directory indexes; story payloads use explicit `.json` paths. Unknown routes return the static 404 page. Do not enable SPA fallback, which could turn missing JSON requests into misleading HTML responses.

```sh
npm ci
npm run validate
npm run preview:cloudflare
# After account/project selection and release approval:
npm run deploy:workers
```

The Worker name is `epoch`; select the intended account and adjust the name/domain before the first deployment. No account ID, token, secret, domain or remote resource is created by this configuration. Preview uses the local Workers runtime. A live release should also check an entry deep link, a JSON story, a missing path and browser Back on the final domain.

Wrangler 4.145.0 is pinned. The registry advertised 4.146.0 during implementation but returned 404 for its tarball; the preceding available release was selected.

## Pages — alternative

Connect the GitHub repository in Pages. Set build command `npm run build`, output directory `build`, and Node 22. No Pages Functions or Cloudflare SvelteKit server adapter is needed. Keep the Workers Wrangler config for Workers; use dashboard build settings for Pages rather than pointing Pages at the Workers-only config.

Preview branches can build automatically; choose the production branch explicitly. Rejected content prevents a new build without changing the last successful deployment. Keep CMS/editor credentials on the editorial/build side if a CMS is added later.

## Authoritative platform references

- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Static generation and 404 handling](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)
- [HTML and trailing-slash handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)
- [SvelteKit on Pages, including adapter-static](https://developers.cloudflare.com/pages/framework-guides/deploy-a-svelte-kit-site/)
