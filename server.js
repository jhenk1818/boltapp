import express from 'express';
import cors from 'cors';
import { URL } from 'url';
import crypto from 'crypto';

const app = express();

// Force HTTPS
app.use((req, res, next) => {
  if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// Configure minimal CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type'],
  credentials: false
};

app.use(cors(corsOptions));
app.use(express.json());

// Strip sensitive headers middleware
app.use((req, res, next) => {
  const headersToRemove = [
    'user-agent', 'accept', 'accept-language', 'accept-encoding',
    'cookie', 'host', 'origin', 'referer', 'sec-ch-ua',
    'sec-ch-ua-mobile', 'sec-ch-ua-platform', 'sec-fetch-dest',
    'sec-fetch-mode', 'sec-fetch-site', 'upgrade-insecure-requests',
    'x-forwarded-for', 'x-real-ip'
  ];

  headersToRemove.forEach(header => {
    delete req.headers[header];
  });

  req.headers.host = 'anonymous';
  req.cookies = {};
  
  res.removeHeader('X-Powered-By');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  next();
});

// Rate limiting
const rateLimit = new Map();
const RATE_LIMIT = 100; // requests per window
const RATE_WINDOW = 3600000; // 1 hour in milliseconds

app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, firstRequest: now });
  } else {
    const limit = rateLimit.get(ip);
    if (now - limit.firstRequest > RATE_WINDOW) {
      limit.count = 1;
      limit.firstRequest = now;
    } else if (limit.count >= RATE_LIMIT) {
      return res.status(429).json({ error: 'Too many requests' });
    } else {
      limit.count++;
    }
  }
  
  next();
});

// Clean up rate limit data every hour
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimit.entries()) {
    if (now - data.firstRequest > RATE_WINDOW) {
      rateLimit.delete(ip);
    }
  }
}, RATE_WINDOW);

// Secure URL mapping with encryption
class SecureUrlStore {
  constructor() {
    this.mappings = new Map();
    this.key = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
    this.iv = process.env.ENCRYPTION_IV || crypto.randomBytes(16);
  }

  encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', this.key, this.iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decrypt(encrypted) {
    try {
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, this.iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      return null;
    }
  }

  add(url) {
    const id = crypto.randomBytes(16).toString('hex');
    const encrypted = this.encrypt(url);
    this.mappings.set(id, encrypted);
    
    setTimeout(() => {
      this.mappings.delete(id);
    }, 24 * 60 * 60 * 1000);
    
    return id;
  }

  get(id) {
    const encrypted = this.mappings.get(id);
    return encrypted ? this.decrypt(encrypted) : null;
  }
}

const urlStore = new SecureUrlStore();

const TRACKING_PARAMS = [
  'utm_', 'fbclid', 'gclid', 'ref', 'source',
  '_ga', '_gl', 'mc_', 'mc_eid', 'mkt_tok',
  'igshid', 'yclid', '_hsenc', '_hsmi', 'hsCtaTracking',
  'wbraid', 'gbraid', 'dclid', 'zanpid', 'msclkid',
  'trk', 'trkCampaign', 'sc_campaign', 'hsa_', 'session_id',
  'visitor_id', '_branch_', '_bta_', 'wickedid', 'wickedsource'
];

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.post('/register', (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const id = urlStore.add(url);
    res.json({ id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register URL' });
  }
});

// New simplified redirect endpoint
app.get('/redirect', (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(404).send('URL not found');
    }

    const parsedUrl = new URL(url);
    const searchParams = new URLSearchParams(parsedUrl.search);
    
    for (const [key] of searchParams) {
      const lowerKey = key.toLowerCase();
      if (TRACKING_PARAMS.some(param => lowerKey.includes(param)) || 
          /^(id|sid|uid|user|visitor|session)/i.test(lowerKey)) {
        searchParams.delete(key);
      }
    }

    parsedUrl.hash = '';
    parsedUrl.search = searchParams.toString();
    const cleanUrl = parsedUrl.toString();

    // Set comprehensive security headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Permissions-Policy', 'interest-cohort=()');
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="referrer" content="no-referrer">
          <meta http-equiv="refresh" content="0;url=${cleanUrl}">
          <script>
            // Clear any existing data
            localStorage.clear();
            sessionStorage.clear();
            
            // Clear cookies
            document.cookie.split(";").forEach(function(c) { 
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
            
            // Add random delay between 1-3 seconds
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

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    res.status(400).send('Invalid URL');
  }
});

// Keep the original redirect/:id endpoint for backward compatibility
app.get('/redirect/:id', (req, res) => {
  try {
    const { id } = req.params;
    const url = urlStore.get(id);
    
    if (!url) {
      return res.status(404).send('URL not found');
    }

    const parsedUrl = new URL(url);
    const searchParams = new URLSearchParams(parsedUrl.search);
    
    for (const [key] of searchParams) {
      const lowerKey = key.toLowerCase();
      if (TRACKING_PARAMS.some(param => lowerKey.includes(param)) || 
          /^(id|sid|uid|user|visitor|session)/i.test(lowerKey)) {
        searchParams.delete(key);
      }
    }

    parsedUrl.hash = '';
    parsedUrl.search = searchParams.toString();
    const cleanUrl = parsedUrl.toString();

    // Set comprehensive security headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Permissions-Policy', 'interest-cohort=()');
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="referrer" content="no-referrer">
          <meta http-equiv="refresh" content="0;url=${cleanUrl}">
          <script>
            // Clear any existing data
            localStorage.clear();
            sessionStorage.clear();
            
            // Clear cookies
            document.cookie.split(";").forEach(function(c) { 
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
            
            // Add random delay between 1-3 seconds
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

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    res.status(400).send('Invalid URL');
  }
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Redirect server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server shutting down');
    process.exit(0);
  });
});