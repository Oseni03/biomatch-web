import { Clock, Heart, QrCode } from "lucide-react";
import { BLOOD_GROUP_UNKNOWN } from "./donor-constants";

type DonorPassCardProps = {
    fullName: string;
    phone: string;
    bloodGroup: string;
    passId: string;
};

// The pass is a physical-card metaphor, so it stays dark in both light and dark themes.
export function DonorPassCard({ fullName, phone, bloodGroup, passId }: DonorPassCardProps) {
    const bloodGroupLabel =
        bloodGroup === BLOOD_GROUP_UNKNOWN ? "Unknown (to be screened)" : bloodGroup;

    return (
        <section
            aria-label="Your donor pass"
            className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-br from-[#1c0d12] to-[#0c0d12] p-5 text-center shadow-lg"
        >
            <div className="mb-4 flex items-start justify-between">
                <div className="text-left">
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-red-400">
                        BioMATCH Donor Pass
                    </span>
                    <h3 className="mt-0.5 text-base font-bold text-white">{fullName}</h3>
                    <p className="font-mono text-xs text-white/70">{phone}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-red-500/40 bg-red-600/20">
                    <Heart className="h-5 w-5 text-red-500" aria-hidden="true" />
                </div>
            </div>

            <div className="my-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                <div className="text-left">
                    <span className="block font-mono text-[10px] uppercase text-white/60">
                        Blood Group
                    </span>
                    <strong className="font-mono text-sm font-bold text-red-300">
                        {bloodGroupLabel}
                    </strong>
                </div>
                <div className="text-right">
                    <span className="block font-mono text-[10px] uppercase text-white/60">
                        Screening Status
                    </span>
                    <span className="flex items-center justify-end gap-1 text-xs font-semibold text-amber-400">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        Awaiting screening
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-white/20 bg-white/[0.03] p-3">
                <QrCode className="h-12 w-12 text-white/80" aria-hidden="true" />
                <div className="text-left text-xs text-white/70">
                    <span className="block text-[11px] font-semibold text-white">
                        PASS ID: {passId}
                    </span>
                    Present to blood bank clerk for rapid cross-match registration.
                </div>
            </div>
        </section>
    );
}