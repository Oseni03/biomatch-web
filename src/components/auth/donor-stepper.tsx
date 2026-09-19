import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { DONOR_STEPS } from "./donor-constants";

type DonorStepperProps = {
    currentStep: number;
};

export function DonorStepper({ currentStep }: DonorStepperProps) {
    return (
        <nav aria-label="Donor registration progress" className="mb-6 px-1">
            <ol className="flex items-start">
                {DONOR_STEPS.map((step, index) => {
                    const isCompleted = step.num < currentStep;
                    const isCurrent = step.num === currentStep;

                    return (
                        <li
                            key={step.num}
                            aria-current={isCurrent ? "step" : undefined}
                            className="relative flex flex-1 flex-col items-center"
                        >
                            {/* Connector: runs from the previous circle's centre to this one's */}
                            {index > 0 && (
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        "absolute left-[-50%] top-[13px] h-0.5 w-full transition-colors duration-300",
                                        step.num <= currentStep ? "bg-brand" : "bg-border",
                                    )}
                                />
                            )}

                            <span
                                className={cn(
                                    "relative z-10 flex h-7 w-7 items-center justify-center rounded-full border font-mono text-xs font-bold transition-colors",
                                    isCurrent && "border-brand bg-brand text-white",
                                    isCompleted && "border-emerald-500 bg-emerald-500 text-white",
                                    !isCurrent &&
                                    !isCompleted &&
                                    "border-border bg-card text-muted-foreground",
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                ) : (
                                    step.num
                                )}
                            </span>

                            <span
                                className={cn(
                                    "sr-only mt-1 text-center text-[10px] font-medium sm:not-sr-only",
                                    isCurrent ? "text-foreground" : "text-muted-foreground",
                                )}
                            >
                                {step.label}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}