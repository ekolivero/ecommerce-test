'use client';

import { useEffect, useRef } from 'react';
import { InjectableToolbar, type ToolbarConfig } from './InjectableToolbar';

interface InjectableToolbarWrapperProps {
  config?: ToolbarConfig;
}

export function InjectableToolbarWrapper({ config = {} }: InjectableToolbarWrapperProps) {
  const toolbarRef = useRef<InjectableToolbar | null>(null);

  useEffect(() => {
    // Initialize the toolbar when component mounts
    if (!toolbarRef.current) {
      toolbarRef.current = new InjectableToolbar({
        autoActivate: true, // Auto-activate for demo
        ...config
      });
      toolbarRef.current.init();
    }

    // Cleanup when component unmounts
    return () => {
      if (toolbarRef.current) {
        toolbarRef.current.destroy();
        toolbarRef.current = null;
      }
    };
  }, [config]);

  // This component doesn't render anything visible - the toolbar creates its own DOM elements
  return null;
} 