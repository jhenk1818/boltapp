// Cloudflare Worker script
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Random delay between 1-3 seconds
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000))

  // Parse the URL and get the destination
  const url = new URL(request.url)
  const stripeUrl = url.searchParams.get('url')

  if (!stripeUrl) {
    return new Response('Missing URL parameter', { status: 400 })
  }

  try {
    // Parse the destination URL to clean tracking parameters
    const destinationUrl = new URL(stripeUrl)
    
    // List of known tracking parameters to strip
    const TRACKING_PARAMS = [
      'utm_', 'fbclid', 'gclid', 'ref', 'source',
      '_ga', '_gl', 'mc_', 'mc_eid', 'mkt_tok',
      'igshid', 'yclid', '_hsenc', '_hsmi', 'hsCtaTracking',
      'wbraid', 'gbraid', 'dclid', 'zanpid', 'msclkid',
      'trk', 'trkCampaign', 'sc_campaign', 'hsa_', 'session_id',
      'visitor_id', '_branch_', '_bta_', 'wickedid', 'wickedsource'
    ]
    
    // Strip all tracking parameters
    const searchParams = new URLSearchParams(destinationUrl.search)
    for (const [key] of [...searchParams.entries()]) {
      const lowerKey = key.toLowerCase()
      if (TRACKING_PARAMS.some(param => lowerKey.includes(param)) || 
          /^(id|sid|uid|user|visitor|session)/i.test(lowerKey)) {
        searchParams.delete(key)
      }
    }
    
    // Remove hash fragments that might contain tracking info
    destinationUrl.hash = ''
    
    // Reconstruct clean URL
    destinationUrl.search = searchParams.toString()
    const cleanUrl = destinationUrl.toString()

    // Create HTML response with meta refresh and JavaScript redirect
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="referrer" content="no-referrer">
          <meta http-equiv="refresh" content="0;url=${cleanUrl}">
          <script>
            // Clear any existing data
            try {
              localStorage.clear();
              sessionStorage.clear();
              
              // Clear cookies
              document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
              });
            } catch (e) {
              // Ignore errors
            }
            
            // Add random delay
            setTimeout(() => {
              // Perform the redirect
              window.location.replace("${cleanUrl}");
            }, Math.floor(Math.random() * 2000) + 1000);
          </script>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              background: #000;
              color: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .loader {
              border: 3px solid rgba(255, 255, 255, 0.3);
              border-radius: 50%;
              border-top: 3px solid #fff;
              width: 30px;
              height: 30px;
              animation: spin 1s linear infinite;
              margin-right: 15px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .container {
              display: flex;
              align-items: center;
            }
          </style>
        </head>
        <body>
          <noscript>
            <meta http-equiv="refresh" content="3;url=${cleanUrl}">
          </noscript>
          <div class="container">
            <div class="loader"></div>
            <div>Redirecting securely...</div>
          </div>
        </body>
      </html>
    `;

    // Set comprehensive security headers
    const responseHeaders = new Headers({
      'Content-Type': 'text/html',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Referrer-Policy': 'no-referrer',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Clear-Site-Data': '"cache", "cookies", "storage"',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Permissions-Policy': 'interest-cohort=()'
    })

    return new Response(html, {
      status: 200,
      headers: responseHeaders
    })
  } catch (error) {
    return new Response('Error processing URL: ' + error.message, { status: 400 })
  }
}