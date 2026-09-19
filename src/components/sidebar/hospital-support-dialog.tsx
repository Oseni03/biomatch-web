"use client";

import { HelpCircle, Mail, Phone, ShieldCheck } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const SUPPORT_PHONE = "+2348002466282";
const SUPPORT_PHONE_LABEL = "0800 246 6282";
const SUPPORT_EMAIL = "hospital-dispatch@biomatch.ng";

interface HospitalSupportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function HospitalSupportDialog({ open, onOpenChange }: HospitalSupportDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HelpCircle className="size-4 text-brand" aria-hidden="true" />
                        Hospital Emergency Support
                    </DialogTitle>
                    <DialogDescription>BioMATCH Emergency Coordination Center</DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="rounded-xl border border-border bg-muted p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Emergency Dispatch Hotline (24/7 Priority)
                        </div>
                        <a
                            href={`tel:${SUPPORT_PHONE}`}
                            className="mt-1.5 block font-mono text-sm font-semibold text-brand hover:underline"
                        >
                            {SUPPORT_PHONE_LABEL}
                        </a>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                            Dedicated line for emergency room surgery teams and blood bank supervisors.
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-muted p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Clinical Operations Email
                        </div>
                        <a
                            href={`mailto:${SUPPORT_EMAIL}`}
                            className="mt-1.5 flex items-center gap-1.5 font-mono text-xs font-semibold text-brand hover:underline"
                        >
                            <Mail className="size-3.5" aria-hidden="true" />
                            {SUPPORT_EMAIL}
                        </a>
                    </div>

                    <div className="rounded-xl border border-border bg-muted p-3">
                        <div className="flex items-start gap-2">
                            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden="true" />
                            <div>
                                <p className="text-xs font-semibold text-sidebar-foreground">
                                    NDPR &amp; Health Security Guaranteed
                                </p>
                                <p className="mt-1 text-xs leading-snug text-muted-foreground">
                                    Donor contact details are protected under hospital NDPR standards. Only
                                    verified blood bank staff can coordinate arrivals.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="w-full rounded-xl"
                >
                    Close
                </Button>
            </DialogContent>
        </Dialog>
    );
}