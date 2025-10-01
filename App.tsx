import React, { useState, useEffect } from 'react';
import Landing from './Landing';
import Order from './Order';

// --- Main App Component (Router) ---

function App() {
  const [isOrdering, setIsOrdering] = useState(false);

  useEffect(() => {
    // This component acts as a router.
    // It checks for a URL query parameter to decide which page to show.
    // The link sent via the LINE welcome message should have "?ordering=true"
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('ordering') === 'true') {
      setIsOrdering(true);
    }
  }, []);

  // If the 'ordering=true' parameter is present, show the order form.
  // Otherwise, show the landing page with instructions to add the LINE friend.
  return isOrdering ? <Order /> : <Landing />;
}

export default App;
