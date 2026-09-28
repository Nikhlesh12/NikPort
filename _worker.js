const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
};

function decorate(response, pathname) {
    const headers = new Headers(response.headers);
    Object.entries(securityHeaders).forEach(([name, value]) => headers.set(name, value));
    const isCodeAsset = /\.(?:css|js)$/i.test(pathname);
    headers.set(
        'Cache-Control',
        isCodeAsset
            ? 'public, max-age=0, must-revalidate'
            : pathname.startsWith('/assets/')
            ? 'public, max-age=604800, stale-while-revalidate=86400'
            : 'public, max-age=0, must-revalidate',
    );
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        const legacyRoutes = {
            '/index.php': '/',
            '/robots.php': '/robots.txt',
            '/sitemap.php': '/sitemap.xml',
        };
        if (legacyRoutes[url.pathname]) {
            return Response.redirect(new URL(legacyRoutes[url.pathname], url.origin), 301);
        }

        if (/\.(?:php|phtml|phar|htaccess)$/i.test(url.pathname) || url.pathname.includes('/smtp_')) {
            return new Response('Not Found', {
                status: 404,
                headers: {
                    'Content-Type': 'text/plain; charset=UTF-8',
                    'Cache-Control': 'no-store',
                    'X-Content-Type-Options': 'nosniff',
                },
            });
        }

        const response = await env.ASSETS.fetch(request);
        const contentType = response.headers.get('content-type') || '';

        if (!contentType.includes('text/html') && !contentType.includes('xml') && !contentType.includes('text/plain')) {
            return decorate(response, url.pathname);
        }

        const origin = url.origin;
        const html = (await response.text()).replaceAll('__SITE_ORIGIN__', origin);
        const headers = new Headers(response.headers);

        return decorate(new Response(html, {
            status: response.status,
            statusText: response.statusText,
            headers,
        }), url.pathname);
    },
};
