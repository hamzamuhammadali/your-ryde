import React from 'react';
import styled from 'styled-components';
import { Button } from './index';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 2rem;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #dc3545;
`;

const ErrorTitle = styled.h2`
  color: #343a40;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const ErrorMessage = styled.p`
  color: #6c757d;
  margin-bottom: 2rem;
  max-width: 500px;
  line-height: 1.5;
`;

const ErrorDetails = styled.details`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f1f3f4;
  border-radius: 4px;
  max-width: 600px;
  
  summary {
    cursor: pointer;
    font-weight: 500;
    color: #495057;
    margin-bottom: 0.5rem;
  }
  
  pre {
    background-color: #ffffff;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.875rem;
    color: #dc3545;
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // In production, you might want to log this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId } = this.state;
      const { fallback: Fallback } = this.props;

      // If a custom fallback component is provided, use it
      if (Fallback) {
        return (
          <Fallback
            error={error}
            errorInfo={errorInfo}
            resetError={this.handleReset}
          />
        );
      }

      // Default error UI
      return (
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Oops! Something went wrong</ErrorTitle>
          <ErrorMessage>
            We're sorry, but something unexpected happened. This error has been logged 
            and we'll look into it. Please try refreshing the page or go back to the home page.
          </ErrorMessage>
          
          <ButtonGroup>
            <Button onClick={this.handleReset} variant="primary">
              Try Again
            </Button>
            <Button onClick={this.handleReload} variant="outline">
              Reload Page
            </Button>
            <Button onClick={this.handleGoHome} variant="outline">
              Go Home
            </Button>
          </ButtonGroup>

          {process.env.NODE_ENV === 'development' && error && (
            <ErrorDetails>
              <summary>Error Details (Development Only)</summary>
              <div>
                <strong>Error ID:</strong> {errorId}
              </div>
              <pre>
                {error.toString()}
                {errorInfo && errorInfo.componentStack}
              </pre>
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;