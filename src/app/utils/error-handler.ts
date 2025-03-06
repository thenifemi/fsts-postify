'use client';

import React from 'react';
import { toast } from 'sonner';

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
    api: 'Server Error',
    validation: 'Validation Error',
    unknown: 'An error occurred',
  };

  // Show toast with appropriate styling
  toast.error(title || defaultTitles[type], {
    description: errorMessage,
  });

  // Also log to console for debugging
  console.error(`[${type.toUpperCase()}]`, error);
}

// Specialized error handlers
export const authError = (
  error: Error | string,
  options: Omit<ErrorOptions, 'type'> = {}
) => handleError(error, { ...options, type: 'auth' });

export const apiError = (
  error: Error | string,
  options: Omit<ErrorOptions, 'type'> = {}
) => handleError(error, { ...options, type: 'api' });

export const validationError = (
  error: Error | string,
  options: Omit<ErrorOptions, 'type'> = {}
) => handleError(error, { ...options, type: 'validation' });
