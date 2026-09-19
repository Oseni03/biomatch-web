import { Bell } from "lucide-react";
import { AuthSelect } from "./auth-select";
import { SCREENING_HOSPITALS } from "./donor-constants";
import { DonorPassCard } from "./donor-pass-card";

type DonorScreeningStepProps = {
    hospital: string;
    onHospitalChange: (value: string) => void;
};

/** Step 3: Screening Pass */
export function DonorScreeningStep({ hospital, onHospitalChange }: DonorScreeningStepProps) {
    return (
        <AuthSelect
            id="signup-hospital"
            label="Preferred Local Hospital for Screening"
            value={hospital}
            onChange={(e) => onHospitalChange(e.target.value)}
            options={SCREENING_HOSPITALS}
            hint="You can still show your pass at any accredited hospital."
        />
    );
}

type DonorAlertStepProps = {
    fullName: string;
    phone: string;
    bloodGroup: string;
    passId: string;
    emergencyOnly: boolean;
    onEmergencyOnlyChange: (value: boolean) => void;
};

/** Step 4: Alert Ready */
export function DonorAlertStep({
    fullName,
    phone,
    bloodGroup,
    passId,
    emergencyOnly,
    onEmergencyOnlyChange,
}: DonorAlertStepProps) {
    return (
        <div className="space-y-4">
            <DonorPassCard
                fullName={fullName}
                phone={phone}
                bloodGroup={bloodGroup}
                passId={passId}
            />

            <label
                htmlFor="signup-emergency-only"
                className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border bg-muted p-4"
            >
                <span className="flex items-start gap-3">
                    <Bell className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                    <span>
                        <span className="block text-sm font-medium text-foreground">
                            Emergency dispatches only
                        </span>
                        <span className="block text-xs text-muted-foreground">
                            Only receive alerts when trauma, surgery, or maternal emergencies arise
                            nearby.
                        </span>
                    </span>
                </span>
                <input
                    id="signup-emergency-only"
                    type="checkbox"
                    checked={emergencyOnly}
                    onChange={(e) => onEmergencyOnlyChange(e.target.checked)}
                    className="h-4 w-4 shrink-0 cursor-pointer accent-red-600"
                />
            </label>
        </div>
    );
}