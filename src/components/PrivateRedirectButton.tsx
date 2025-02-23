import React, { useState } from 'react';
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

  const handlePrivateRedirect = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!destination) {
      console.warn('No destination URL provided');
      return;
    }

    setIsLoading(true);
    
    try {
      // Clear client-side storage before redirect
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });

      // Get the redirect server URL from environment or default to localhost in development
      const serverUrl = process.env.REDIRECT_SERVER_URL || 'http://localhost:3001';

      try {
        // Register the URL first
        const registerResponse = await fetch(`${serverUrl}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: destination }),
        });

        if (!registerResponse.ok) {
          throw new Error('Failed to register URL');
        }

        const { id } = await registerResponse.json();
        
        // Redirect through the secure server
        window.location.href = `${serverUrl}/redirect/${id}`;
      } catch (error) {
        console.error('Server error:', error);
        // Fall back to direct redirect if server is unavailable
        window.location.href = destination;
      }
    } catch (error) {
      console.error('Redirect failed:', error);
      // Fall back to direct redirect if anything fails
      window.location.href = destination;
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