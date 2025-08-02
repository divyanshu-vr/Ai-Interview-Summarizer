import React from 'react';
import ThemeProvider, { useThemeMode } from './components/ThemeProvider';
import NotificationProvider from './components/NotificationSystem';
import MainDashboard from './components/MainDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

/**
 * App wrapper component that provides theme context
 */
const AppContent = () => {
  const { isDarkMode, toggleTheme } = useThemeMode();

  return (
    <MainDashboard 
      onThemeChange={toggleTheme}
      isDarkMode={isDarkMode}
      initialTab={0}
    />
  );
};

/**
 * Main App component with providers
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider 
          maxNotifications={5}
          position="bottom-right"
          stackSpacing={70}
        >
          <div className="App">
            <AppContent />
          </div>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;