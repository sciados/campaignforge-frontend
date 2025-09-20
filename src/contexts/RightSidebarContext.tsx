"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RightSidebarContextType {
  content: ReactNode | null;
  setContent: (content: ReactNode | null) => void;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

const RightSidebarContext = createContext<RightSidebarContextType | undefined>(undefined);

export function RightSidebarProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  return (
    <RightSidebarContext.Provider value={{ content, setContent, isVisible, setIsVisible }}>
      {children}
    </RightSidebarContext.Provider>
  );
}

export function useRightSidebar() {
  const context = useContext(RightSidebarContext);
  if (context === undefined) {
    throw new Error('useRightSidebar must be used within a RightSidebarProvider');
  }
  return context;
}