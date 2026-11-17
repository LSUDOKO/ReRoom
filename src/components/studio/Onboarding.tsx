"use client";
import { useEffect, useState } from "react";
import { Button } from "../ui";

const STEPS = [
  { title: "This is your room in 3D", body: "Drag to look around and scroll to move closer. Switch to Walk to stroll through it at eye height." },
  { title: "Add furniture that fits", body: "Pick from the library, describe anything in words, or snap a product photo. Lux3D builds it at real size." },
  { title: "Open it, then restyle it", body: "Double-click a wardrobe or drawer to open it. Pick a style under the room and every piece gets the new finish." },
];

const KEY = "reroom:onboarded";

export default function Onboarding() {
  const [step, setStep] = useState<number | null>(null);
  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setStep(0);
    } catch {}
  }, []);
  if (step === null) return null;
  const done = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setStep(null);
  };
  const s = STEPS[step];
  return (
    <div className="fixed bottom-24 left-1/2 z-40 w-[min(92vw,380px)] -translate-x-1/2">
      <div className="rise rounded-panel bg-white p-5 shadow-[0_12px_40px_rgb(18_20_23/0.25)]" role="dialog" aria-label="Getting started">
        <div className="mb-1 text-xs text-slate">Step {step + 1} of {STEPS.length}</div>
        <h3 className="font-display text-xl">{s.title}</h3>
        <p className="mt-1 text-sm text-slate">{s.body}</p>
        <div className="mt-4 flex items-center justify-between">
          <button onClick={done} className="text-sm text-slate hover:text-ink">Skip</button>
          <Button variant="primary" size="sm" onClick={() => (step < STEPS.length - 1 ? setStep(step + 1) : done())}>
            {step < STEPS.length - 1 ? "Next" : "Start designing"}
          </Button>
        </div>
      </div>
    </div>
  );
}
