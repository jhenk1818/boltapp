import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

interface PrivateRedirectButtonProps {
  destination: string;
  className?: string;
  children?: React.ReactNode;
}

const PrivateRedirectButton: React.FC<PrivateRedirectButtonProps> = ({
  destination,
  className = '',
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Set referrer policy when component mounts
  useEffect(() => {
    // Ensure referrer policy is set
    const metaTag = document.querySelector('meta[name="referrer"]') || document.createElement('meta');
    metaTag.setAttribute('name', 'referrer');
    metaTag.setAttribute('content', 'no-referrer');
    if (!document.querySelector('meta[name="referrer"]')) {
      document.head.appendChild(metaTag);
    }
  }, []);

  const handlePrivateRedirect = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!destination) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Ensure referrer policy is set
      const metaTag = document.querySelector('meta[name="referrer"]') || document.createElement('meta');
      metaTag.setAttribute('name', 'referrer');
      metaTag.setAttribute('content', 'no-referrer');
      if (!document.querySelector('meta[name="referrer"]')) {
        document.head.appendChild(metaTag);
      }

      // Random delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

      // Use the server redirect endpoint if in development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const serverUrl = 'http://localhost:3001';
        
        try {
          // Register the URL first
          const registerResponse = await fetch(`${serverUrl}/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Referrer-Policy': 'no-referrer',
            },
            credentials: 'omit', // Prevent sending cookies
            body: JSON.stringify({ url: destination }),
          });

          if (!registerResponse.ok) {
            throw new Error(`Failed to register URL`);
          }

          const { id } = await registerResponse.json();
          
          // Create a temporary anchor element with explicit referrer policy
          const link = document.createElement('a');
          link.href = `${serverUrl}/redirect/${id}`;
          link.rel = 'noopener noreferrer';
          link.referrerPolicy = 'no-referrer';
          
          // Trigger the redirect
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        } catch (error) {
          console.error('Server error:', error instanceof Error ? error.message : 'Unknown server error');
        }
      }

      // In production, use the Cloudflare Worker
      // Replace this URL with your actual Cloudflare Worker URL after deployment
      const workerUrl = 'https://stripe-redirect-proxy.your-subdomain.workers.dev';
      const proxyUrl = `${workerUrl}?url=${encodeURIComponent(destination)}`;

      // Create minimal anchor for redirect with explicit referrer policy
      const link = document.createElement('a');
      link.href = proxyUrl;
      link.rel = 'noopener noreferrer';
      link.referrerPolicy = 'no-referrer';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // Add random delay before fallback
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

      // Fallback with minimal exposure
      const link = document.createElement('a');
      link.href = destination;
      link.rel = 'noopener noreferrer';
      link.referrerPolicy = 'no-referrer';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePrivateRedirect}
      disabled={isLoading || !destination}
      className={`flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors w-full ${
        isLoading || !destination ? 'opacity-75 cursor-not-allowed' : ''
      } ${className}`}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          <span>Redirecting...</span>
        </>
      ) : children ? (
        children
      ) : (
        <>
          <span>Open Privately</span>
          <ExternalLink className="w-4 h-4" />
        </>
      )}
    </button>
  );
};

export default PrivateRedirectButton;