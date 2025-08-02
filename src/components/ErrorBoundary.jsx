import React from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Force reload if needed
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              The application encountered an unexpected error. This might be due to a service hanging or failing to stop properly.
            </Typography>
            
            {this.state.error && (
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', mb: 2 }}>
                {this.state.error.toString()}
              </Typography>
            )}
            
            <Button 
              variant="contained" 
              onClick={this.handleReset}
              sx={{ mr: 1 }}
            >
              Try Again
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;