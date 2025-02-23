import express from 'express';
import cors from 'cors';
import { URL } from 'url';
import crypto from 'crypto';

const app = express();

// Configure CORS for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Secure URL mapping with encryption
class SecureUrlStore {
  constructor() {
    this.mappings = new Map();
    // In production, these should come from environment variables
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
      console.error('Decryption failed:', error);
      return null;
    }
  }

  add(url) {
    const id = crypto.randomBytes(16).toString('hex');
    const encrypted = this.encrypt(url);
    this.mappings.set(id, encrypted);
    
    // Clear old mappings after 24 hours
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

// List of known tracking parameters to strip
const TRACKING_PARAMS = [
  'utm_', 'fbclid', 'gclid', 'ref', 'source',
  '_ga', '_gl', 'mc_', 'mc_eid', 'mkt_tok',
  'igshid', 'yclid', '_hsenc', '_hsmi', 'hsCtaTracking',
  'wbraid', 'gbraid', 'dclid', 'zanpid', 'msclkid',
  'trk', 'trkCampaign', 'sc_campaign', 'hsa_', 'session_id',
  'visitor_id', '_branch_', '_bta_', 'wickedid', 'wickedsource'
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Register a URL and get a secure ID
app.post('/register', (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const id = urlStore.add(url);
    res.json({ id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register URL' });
  }
});

app.get('/redirect/:id', (req, res) => {
  try {
    const { id } = req.params;
    const url = urlStore.get(id);
    
    if (!url) {
      return res.status(404).send('URL not found');
    }

    // Parse the URL
    const parsedUrl = new URL(url);
    
    // Strip all tracking parameters
    const searchParams = new URLSearchParams(parsedUrl.search);
    for (const [key] of searchParams) {
      const lowerKey = key.toLowerCase();
      if (TRACKING_PARAMS.some(param => lowerKey.includes(param)) || 
          /^(id|sid|uid|user|visitor|session)/i.test(lowerKey)) {
        searchParams.delete(key);
      }
    }

    // Remove hash fragments that might contain tracking info
    parsedUrl.hash = '';
    
    // Reconstruct clean URL
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
    
    // Use HTML meta refresh as a fallback for JavaScript redirects
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
            
            // Perform the redirect
            window.location.replace("${cleanUrl}");
          </script>
        </head>
        <body>
          <noscript>
            <meta http-equiv="refresh" content="0;url=${cleanUrl}">
          </noscript>
          Redirecting...
        </body>
      </html>
    `;

    // Send HTML instead of direct redirect
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(400).send('Invalid URL');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Redirect server running on port ${PORT}`);
});