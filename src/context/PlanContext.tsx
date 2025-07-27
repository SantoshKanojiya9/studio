
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Plan = 'Silver' | 'Gold';

interface PlanContextType {
  plan: Plan;
  setPlan: (plan: Plan) => void;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<Plan>('Silver'); // Default to Silver

  return (
    <PlanContext.Provider value={{ plan, setPlan }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
}
