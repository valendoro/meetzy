"use client";

import { useBehaviorTracker } from "@/lib/behavior-tracker";
import Hero from "./Hero";
import MiloDemo from "./MiloDemo";
import MiloWidget from "./MiloWidget";

export default function LandingOrchestrator() {
  const tracker = useBehaviorTracker();

  return (
    <>
      <Hero tracker={tracker} />
      <MiloDemo tracker={tracker} />
      {/* Widget flotante — aparece a los 5s automáticamente */}
      <MiloWidget tracker={tracker} />
    </>
  );
}
