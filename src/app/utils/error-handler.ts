'use client';

import { toast } from "@/app/components/ui/use-toast";

type ErrorType = 'auth' | 'api' | 'validation' | 'unknown';

interface ErrorOptions {
  type?: ErrorType;
  title?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Centralized error handling utility that displays toast notifications
 */
export function handleError(error: Error | string, options: ErrorOptions = {}) {
  const { type = 'unknown', title, action } = options;
  
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Default titles based on error type
  const defaultTitles = {
    auth: 'Authentication Error',
    api: 'API Error',
    validation: 'Validation Error',
    unknown: 'An error occurred'
  };

  // Show toast with appropriate styling
  toast({
    variant: 'destructive',
    title: title || defaultTitles[type],
    description: errorMessage,
    action: action ? {
      altText: action.label,
      onClick: action.onClick,
      children: action.label
    } : undefined
  });
  
  // Also log to console for debugging
  console.error(`[${type.toUpperCase()}]`, error);
}

// Specialized error handlers
export const authError = (error: Error | string, options: Omit<ErrorOptions, 'type'> = {}) => 
  handleError(error, { ...options, type: 'auth' });

export const apiError = (error: Error | string, options: Omit<ErrorOptions, 'type'> = {}) => 
  handleError(error, { ...options, type: 'api' });

export const validationError = (error: Error | string, options: Omit<ErrorOptions, 'type'> = {}) => 
  handleError(error, { ...options, type: 'validation' });