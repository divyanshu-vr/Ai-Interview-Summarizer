import { useState, useEffect, useRef, useCallback } from 'react';
import SpeechService from '../services/speechService';

/**
 * Custom React hook for managing speech-to-text transcription functionality
 * Provides state management and lifecycle handling for SpeechService
 */
const useTranscription = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [transcriptSegments, setTranscriptSegments] = useState([]);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [processingMode, setProcessingMode] = useState('webspeech');

  const speechServiceRef = useRef(null);
  const sessionStartTimeRef = useRef(null);

  /**
   * Initialize speech recognition service
   * @param {MediaStream} audioStream - Optional audio stream for system audio processing
   */
  const initialize = useCallback(async (audioStream = null) => {
    if (speechServiceRef.current || isInitializing) {
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      const speechService = new SpeechService();
      
      // Set up callbacks
      speechService.onTranscriptUpdate = (segment) => {
        setCurrentTranscript(segment.isFinal ? '' : segment.text);
        
        // Update segments for real-time display
        if (!segment.isFinal) {
          setTranscriptSegments(prev => {
            const filtered = prev.filter(s => s.isFinal);
            return [...filtered, segment];
          });
        }
      };

      speechService.onSegmentComplete = (segment) => {
        setTranscriptSegments(prev => {
          const filtered = prev.filter(s => s.id !== segment.id);
          return [...filtered, segment];
        });
      };

      speechService.onError = (errorInfo) => {
        setError(errorInfo);
      };

      speechService.onStatusChange = (status) => {
        switch (status) {
          case 'initialized':
            setIsInitialized(true);
            break;
          case 'listening':
            setIsListening(true);
            setIsPaused(false);
            break;
          case 'paused':
            setIsPaused(true);
            break;
          case 'stopped':
            setIsListening(false);
            setIsPaused(false);
            break;
          case 'error':
            setIsListening(false);
            setIsPaused(false);
            break;
        }
      };

      // Initialize the service
      const success = await speechService.initialize(audioStream);
      
      if (success) {
        speechServiceRef.current = speechService;
        setProcessingMode(speechService.processingMode);
        setIsInitialized(true);
      } else {
        throw new Error('Failed to initialize speech recognition service');
      }
    } catch (err) {
      setError({
        message: 'Failed to initialize speech recognition',
        error: err,
        timestamp: Date.now()
      });
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing]);

  /**
   * Start speech recognition
   */
  const startListening = useCallback(async () => {
    if (!speechServiceRef.current || isListening) {
      return false;
    }

    setError(null);
    
    try {
      const success = await speechServiceRef.current.startListening();
      if (success) {
        sessionStartTimeRef.current = Date.now();
        setTranscriptSegments([]);
        setCurrentTranscript('');
      }
      return success;
    } catch (err) {
      setError({
        message: 'Failed to start speech recognition',
        error: err,
        timestamp: Date.now()
      });
      return false;
    }
  }, [isListening]);

  /**
   * Stop speech recognition
   */
  const stopListening = useCallback(() => {
    if (!speechServiceRef.current) {
      return false;
    }

    setError(null);
    
    try {
      // Force stop regardless of current state to prevent race conditions
      const success = speechServiceRef.current.stopListening();
      sessionStartTimeRef.current = null;
      
      // Force update local state immediately
      setIsListening(false);
      setIsPaused(false);
      setCurrentTranscript('');
      
      return success;
    } catch (err) {
      setError({
        message: 'Failed to stop speech recognition',
        error: err,
        timestamp: Date.now()
      });
      
      // Still force update state even if there was an error
      setIsListening(false);
      setIsPaused(false);
      setCurrentTranscript('');
      
      return false;
    }
  }, []); // Remove isListening dependency to prevent race conditions

  /**
   * Pause speech recognition
   */
  const pauseListening = useCallback(() => {
    if (!speechServiceRef.current || !isListening || isPaused) {
      return false;
    }

    setError(null);
    
    try {
      return speechServiceRef.current.pauseListening();
    } catch (err) {
      setError({
        message: 'Failed to pause speech recognition',
        error: err,
        timestamp: Date.now()
      });
      return false;
    }
  }, [isListening, isPaused]);

  /**
   * Resume speech recognition
   */
  const resumeListening = useCallback(async () => {
    if (!speechServiceRef.current || !isPaused) {
      return false;
    }

    setError(null);
    
    try {
      return await speechServiceRef.current.resumeListening();
    } catch (err) {
      setError({
        message: 'Failed to resume speech recognition',
        error: err,
        timestamp: Date.now()
      });
      return false;
    }
  }, [isPaused]);

  /**
   * Get all transcript segments
   */
  const getAllSegments = useCallback(() => {
    return transcriptSegments.filter(segment => segment.isFinal);
  }, [transcriptSegments]);

  /**
   * Get full transcript text
   */
  const getFullTranscript = useCallback(() => {
    const finalSegments = transcriptSegments.filter(segment => segment.isFinal);
    return finalSegments.map(segment => segment.text).join(' ');
  }, [transcriptSegments]);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear all transcript data
   */
  const clearTranscript = useCallback(() => {
    setTranscriptSegments([]);
    setCurrentTranscript('');
  }, []);

  /**
   * Force stop and cleanup - more aggressive than regular stop
   */
  const forceStop = useCallback(async () => {
    if (!speechServiceRef.current) {
      return false;
    }

    setError(null);
    
    // Force update state immediately to prevent UI hanging
    setIsListening(false);
    setIsPaused(false);
    setCurrentTranscript('');
    sessionStartTimeRef.current = null;
    
    try {
      // Force cleanup the service with timeout
      const cleanupPromise = speechServiceRef.current.cleanup();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Force stop timeout')), 5000)
      );
      
      await Promise.race([cleanupPromise, timeoutPromise]);
      
      return true;
    } catch (err) {
      console.warn('Force stop failed or timed out:', err);
      setError({
        message: 'Failed to force stop speech recognition',
        error: err,
        timestamp: Date.now()
      });
      
      // Nullify the service reference to prevent further issues
      speechServiceRef.current = null;
      
      return false;
    }
  }, []);

  /**
   * Get session duration in seconds
   */
  const getSessionDuration = useCallback(() => {
    if (!sessionStartTimeRef.current) return 0;
    return Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechServiceRef.current) {
        try {
          // Try to stop gracefully first
          speechServiceRef.current.stopListening();
          
          // Force cleanup after a short delay if needed
          setTimeout(() => {
            if (speechServiceRef.current) {
              speechServiceRef.current.cleanup().catch(console.warn);
            }
          }, 100);
        } catch (error) {
          console.warn('Error during unmount cleanup:', error);
        } finally {
          speechServiceRef.current = null;
        }
      }
    };
  }, []);

  return {
    // State
    isInitialized,
    isInitializing,
    isListening,
    isPaused,
    currentTranscript,
    transcriptSegments,
    error,
    processingMode,
    
    // Actions
    initialize,
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
    clearError,
    clearTranscript,
    forceStop,
    
    // Utilities
    getAllSegments,
    getFullTranscript,
    getSessionDuration,
    
    // Computed state
    canStart: isInitialized && !isListening,
    canPause: isInitialized && isListening && !isPaused,
    canResume: isInitialized && isListening && isPaused,
    canStop: isInitialized && isListening,
    hasTranscript: transcriptSegments.length > 0 || currentTranscript.length > 0
  };
};

export default useTranscription;