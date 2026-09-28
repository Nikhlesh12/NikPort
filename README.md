# Nikhlesh Portfolio

Production-ready static portfolio configured for Cloudflare Pages.

## Deploy

1. Push this folder to a GitHub or GitLab repository.
2. In Cloudflare Pages, choose **Connect to Git** and select the repository.
3. Use these build settings:
   - Framework preset: `None`
   - Build command: `exit 0`
   - Build output directory: `.`
4. Deploy. The included `_worker.js` is detected automatically and handles static assets, security headers, caching, legacy redirects, and dynamic canonical URLs.

The worker replaces `__SITE_ORIGIN__` with the active Pages/custom-domain origin, so canonical, social, structured-data, and sitemap URLs remain correct on preview and production deployments.

## Contact form

The inquiry form prepares the visitor's brief in WhatsApp. It does not store personal data or require a server secret. Email and LinkedIn remain available as direct alternatives.

## Security note

No credentials belong in this repository. Configure future secrets only through **Cloudflare Dashboard → Workers & Pages → Settings → Variables and Secrets**.
