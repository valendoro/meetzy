"use client";

import { useBehaviorTracker } from "@/lib/behavior-tracker";
import Hero from "./Hero";
import MiloDemo from "./MiloDemo";
import MiloWidget from "./MiloWidget";

export default function LandingClient() {
  const tracker = useBehaviorTracker();

  return (
    <>
      <Hero tracker={tracker} />
      <MiloDemo tracker={tracker} />
      <MiloWidget tracker={tracker} />
    </>
  );
}
