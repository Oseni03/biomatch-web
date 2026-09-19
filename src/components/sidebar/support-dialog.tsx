"use client";

import { HelpCircle, Mail, Phone } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// Keep the dial target and the visible label in sync.
const SUPPORT_PHONE = "+2348002466282";
const SUPPORT_PHONE_LABEL = "0800 246 6282";
const SUPPORT_EMAIL = "support@biomatch.org";

interface SupportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SupportDialog({ open, onOpenChange }: SupportDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HelpCircle className="size-4 text-brand" aria-hidden="true" />
                        BioMATCH Support
                    </DialogTitle>
                    <DialogDescription>
                        Need assistance with an emergency request or blood donation?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <a
                        href={`tel:${SUPPORT_PHONE}`}
                        className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted"
                    >
                        <Phone className="size-4 text-brand" aria-hidden="true" />
                        <div>
                            <p className="text-sm font-medium">Emergency Donor Hotline</p>
                            <p className="text-xs text-muted-foreground">{SUPPORT_PHONE_LABEL}</p>
                        </div>
                    </a>

                    <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted"
                    >
                        <Mail className="size-4 text-brand" aria-hidden="true" />
                        <div>
                            <p className="text-sm font-medium">Email Support</p>
                            <p className="text-xs text-muted-foreground">{SUPPORT_EMAIL}</p>
                        </div>
                    </a>
                </div>
            </DialogContent>
        </Dialog>
    );
}