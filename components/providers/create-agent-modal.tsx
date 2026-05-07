"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CreateAgentWizard from "@/components/dashboard/create-agent/CreateAgentWizard";

type CreateAgentModalContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const CreateAgentModalContext = createContext<CreateAgentModalContextValue | null>(null);

export function useCreateAgentModal(): CreateAgentModalContextValue {
  const ctx = useContext(CreateAgentModalContext);
  if (!ctx) {
    return { open: () => {}, close: () => {}, isOpen: false };
  }
  return ctx;
}

export function CreateAgentModalProvider({
  children,
  userPlan,
  isGuest = false,
}: {
  children: React.ReactNode;
  userPlan: string;
  isGuest?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  return (
    <CreateAgentModalContext.Provider value={{ open: openModal, close: closeModal, isOpen: open }}>
      {children}
      {mounted && open
        ? createPortal(
            <CreateAgentWizard variant="modal" userPlan={userPlan} isGuest={isGuest} onRequestClose={closeModal} />,
            document.body,
          )
        : null}
    </CreateAgentModalContext.Provider>
  );
}
