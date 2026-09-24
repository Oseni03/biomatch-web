"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
	ArrowLeft,
	Check,
	Copy,
	Crosshair,
	Info,
	Loader2,
	MapPin,
	Search,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useDonorDashboard } from "@/hooks/use-donor-dashboard";
import { useLastKnownLocation } from "@/hooks/use-last-known-location";
import { saveDonorProfile } from "@/servers/user";
import { geocodeAddressAction } from "@/servers/location";
import { MarketingConsentToggle } from "@/components/consent/marketing-consent-toggle";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { PhoneVerification } from "@/components/profile/phone-verification";
import { DeleteAccountSection } from "@/components/profile/delete-account-section";
import { ReplayWalkthroughButton } from "@/components/walkthrough/walkthrough-gate";
import {
	BLOOD_GROUP_ENUMS,
} from "@/lib/donor-profile-validation";
import { BLOOD_GROUP_MAP } from "@/lib/donor-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const BLOOD_GROUP_OPTIONS = BLOOD_GROUP_ENUMS.map((value) => ({
	value,
	label: BLOOD_GROUP_MAP[value] ?? value,
}));

type VerificationStatus = "unverified" | "verified" | "failed";

interface ProfileForm {
	name: string;
	bloodGroup: string;
	dateOfBirth: string;
	homeAddress: string;
	state: string;
	lga: string;
	homeLatitude: string;
	homeLongitude: string;
	isAvailable: boolean;
}

const EMPTY_FORM: ProfileForm = {
	name: "",
	bloodGroup: "",
	dateOfBirth: "",
	homeAddress: "",
	state: "",
	lga: "",
	homeLatitude: "",
	homeLongitude: "",
	isAvailable: true,
};

function toDateInput(value: string | Date | null | undefined): string {
	if (!value) return "";
	const d = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(d.getTime())) return "";
	return d.toISOString().slice(0, 10);
}

function toNumberInput(value: number | null | undefined): string {
	return value === null || value === undefined ? "" : String(value);
}

function formFromProfile(profile: {
	name?: string | null;
	donorProfile?: {
		bloodGroup?: string | null;
		dateOfBirth?: string | Date | null;
		homeAddress?: string | null;
		state?: string | null;
		lga?: string | null;
		homeLatitude?: number | null;
		homeLongitude?: number | null;
		isAvailable?: boolean | null;
	} | null;
}): ProfileForm {
	return {
		name: profile.name ?? "",
		bloodGroup: profile.donorProfile?.bloodGroup ?? "",
		dateOfBirth: toDateInput(profile.donorProfile?.dateOfBirth),
		homeAddress: profile.donorProfile?.homeAddress ?? "",
		state: profile.donorProfile?.state ?? "",
		lga: profile.donorProfile?.lga ?? "",
		homeLatitude: toNumberInput(profile.donorProfile?.homeLatitude),
		homeLongitude: toNumberInput(profile.donorProfile?.homeLongitude),
		isAvailable: profile.donorProfile?.isAvailable ?? true,
	};
}

function validateForm(form: ProfileForm): string | null {
	if (!form.name.trim()) return "Please enter your full name";
	if (!form.bloodGroup) return "Please select your blood group";
	if (!form.dateOfBirth) return "Please enter your date of birth";
	const dob = new Date(form.dateOfBirth);
	if (Number.isNaN(dob.getTime())) return "Enter a valid date of birth";
	if (dob.getTime() > Date.now())
		return "Date of birth must be in the past";
	if (!form.state.trim()) return "Please enter your state";
	const latProvided = form.homeLatitude.trim() !== "";
	const lngProvided = form.homeLongitude.trim() !== "";
	if (!latProvided || !lngProvided)
		return "Please pin your home location with latitude and longitude";
	const lat = Number(form.homeLatitude);
	const lng = Number(form.homeLongitude);
	if (!Number.isFinite(lat) || lat < -90 || lat > 90)
		return "Latitude must be a number between -90 and 90";
	if (!Number.isFinite(lng) || lng < -180 || lng > 180)
		return "Longitude must be a number between -180 and 180";
	return null;
}

function Section({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<section className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
			<div>
				<h2 className="text-base font-bold tracking-tight text-foreground">
					{title}
				</h2>
				<p className="text-xs text-muted-foreground">{description}</p>
			</div>
			{children}
		</section>
	);
}

function Field({
	label,
	required,
	hint,
	children,
}: {
	label: string;
	required?: boolean;
	hint?: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<label className="mb-2 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
				{label} {required && <span className="text-brand">*</span>}
			</label>
			{children}
			{hint && (
				<p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
					{hint}
				</p>
			)}
		</div>
	);
}

function SelectGrid({
	options,
	value,
	onChange,
	columns = 2,
}: {
	options: ReadonlyArray<{ value: string; label: string }>;
	value: string;
	onChange: (value: string) => void;
	columns?: 2 | 4;
}) {
	return (
		<div
			className={cn("grid gap-2", columns === 4 ? "grid-cols-4" : "grid-cols-2")}
		>
			{options.map((opt) => (
				<button
					key={opt.value}
					type="button"
					onClick={() => onChange(opt.value)}
					className={cn(
						"cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
						value === opt.value
							? "border-brand bg-brand-light text-brand"
							: "border-border bg-muted text-muted-foreground hover:border-brand/50",
					)}
				>
					{opt.label}
				</button>
			))}
		</div>
	);
}

function VerificationBadge({ status }: { status: VerificationStatus }) {
	const styles: Record<VerificationStatus, string> = {
		unverified:
			"border-status-low/25 bg-status-low-bg text-status-low",
		verified: "border-status-ok/25 bg-status-ok-bg text-status-ok",
		failed: "border-destructive/25 bg-destructive/10 text-destructive",
	};
	const labels: Record<VerificationStatus, string> = {
		unverified: "Unverified",
		verified: "Verified",
		failed: "Verification failed",
	};
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
				styles[status],
			)}
		>
			<span
				className={cn(
					"size-1.5 rounded-full",
					status === "verified"
						? "bg-status-ok"
						: status === "failed"
							? "bg-destructive"
							: "bg-status-low",
				)}
			/>
			{labels[status]}
		</span>
	);
}

function CompletionCard({ done, total }: { done: number; total: number }) {
	const complete = done === total;
	return (
		<div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
			<div className="flex items-center justify-between gap-3">
				<p className="text-sm font-semibold text-foreground">
					{complete ? "Profile complete" : `${done} of ${total} complete`}
				</p>
				<span
					className={cn(
						"rounded-full border px-2.5 py-0.5 text-xs font-semibold",
						complete
							? "border-status-ok/20 bg-status-ok-bg text-status-ok"
							: "border-status-low/20 bg-status-low-bg text-status-low",
					)}
				>
					{complete ? "Complete" : "Incomplete"}
				</span>
			</div>
			<div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
				<div
					className="h-full rounded-full bg-brand transition-all"
					style={{ width: `${(done / total) * 100}%` }}
				/>
			</div>
		</div>
	);
}

function DonorCodeCard({
	donorCode,
	verificationStatus,
}: {
	donorCode: string | null;
	verificationStatus: VerificationStatus;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		if (!donorCode) return;
		try {
			await navigator.clipboard.writeText(donorCode);
			setCopied(true);
			toast.success("Donor code copied");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Could not copy. Please copy it manually.");
		}
	};

	return (
		<div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="text-base font-bold tracking-tight text-foreground">
						Your donor code
					</h2>
					<p className="text-xs text-muted-foreground">
						Show this code at any partner hospital for screening.
					</p>
				</div>
				<VerificationBadge status={verificationStatus} />
			</div>
			{donorCode ? (
				<div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-muted px-4 py-3">
					<span className="font-mono text-lg font-bold tracking-[0.12em] text-foreground">
						{donorCode}
					</span>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleCopy}
						className="shrink-0"
					>
						{copied ? (
							<Check className="h-4 w-4" />
						) : (
							<Copy className="h-4 w-4" />
						)}
						{copied ? "Copied" : "Copy"}
					</Button>
				</div>
			) : (
				<div className="mt-4 rounded-xl border border-dashed border-border bg-muted/50 px-4 py-6 text-center">
					<p className="text-sm font-semibold text-foreground">
						No donor code yet
					</p>
					<p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
						Your unique code is created the first time you save your
						profile below. You will use it at partner hospitals for
						physical screening.
					</p>
				</div>
			)}
		</div>
	);
}

function ScreeningExplainer({ status }: { status: VerificationStatus }) {
	if (status === "verified") return null;
	return (
		<div className="flex items-start gap-3 rounded-2xl border border-status-low/25 bg-status-low-bg/50 p-5 sm:p-6">
			<span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-status-low/30 bg-status-low/15 text-status-low">
				<Info className="size-5" aria-hidden="true" />
			</span>
			<div className="min-w-0">
				<p className="text-sm font-bold tracking-tight text-foreground">
					{status === "failed"
						? "Your last screening did not pass"
						: "You can browse, but matching needs screening"}
				</p>
				<p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
					{status === "failed"
						? "Visit a partner hospital with your donor code to be re-screened. Matching stays paused until a screening passes."
						: "Visit any partner hospital with your donor code for a quick physical screening. Once staff verify you, emergency matching is unlocked."}
				</p>
			</div>
		</div>
	);
}

export function DonorProfileClient() {
	const { data: session, isPending: sessionLoading } = authClient.useSession();
	const { data: user, isLoading: userLoading } = useDonorDashboard();
	useLastKnownLocation(session?.user?.id);
	const queryClient = useQueryClient();
	const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
	const [isSaving, setIsSaving] = useState(false);
	const [isLocating, setIsLocating] = useState(false);
	const [isGeocoding, setIsGeocoding] = useState(false);
	const [initializedUserId, setInitializedUserId] = useState<string | null>(null);
	if (user && user.id !== initializedUserId) {
		setInitializedUserId(user.id);
		setForm(formFromProfile(user));
	}

	const typedUser = user as {
		id: string;
		name?: string | null;
		donorProfile?: {
			donorCode?: string | null;
			verificationStatus?: VerificationStatus | null;
			lastKnownLatitude?: number | null;
			lastKnownLongitude?: number | null;
		} | null;
	} | null | undefined;

	const donorCode = typedUser?.donorProfile?.donorCode ?? null;
	const verificationStatus: VerificationStatus =
		typedUser?.donorProfile?.verificationStatus ?? "unverified";
	const hasLastKnown =
		typedUser?.donorProfile?.lastKnownLatitude != null &&
		typedUser?.donorProfile?.lastKnownLongitude != null;

	const completion = useMemo(() => {
		const sections = [
			form.name.trim() !== "",
			form.bloodGroup !== "",
			form.dateOfBirth !== "",
			form.state.trim() !== "",
			form.homeLatitude.trim() !== "" &&
			form.homeLongitude.trim() !== "",
		];
		const done = sections.filter(Boolean).length;
		return { done, total: sections.length };
	}, [form]);

	const setText =
		(key: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
			setForm((prev) => ({ ...prev, [key]: e.target.value }));

	const setChoice = (key: keyof ProfileForm) => (value: string) =>
		setForm((prev) => ({ ...prev, [key]: value }));

	const handleUseMyLocation = () => {
		if (!("geolocation" in navigator)) {
			toast.error("Geolocation is not supported on this device");
			return;
		}
		setIsLocating(true);
		navigator.geolocation.getCurrentPosition(
			(position) => {
				setForm((prev) => ({
					...prev,
					homeLatitude: String(position.coords.latitude),
					homeLongitude: String(position.coords.longitude),
				}));
				toast.success("Home pin set from your current location");
				setIsLocating(false);
			},
			() => {
				toast.error(
					"Could not read your location. Please allow permission or enter coordinates manually.",
				);
				setIsLocating(false);
			},
			{ timeout: 10000 },
		);
	};

	const handleGeocodeFromAddress = async () => {
		const query = [form.homeAddress.trim(), form.lga.trim(), form.state.trim(), "Nigeria"]
			.filter(Boolean)
			.join(", ");
		if (!query || query === "Nigeria") {
			toast.error("Enter your address, LGA or state first");
			return;
		}
		setIsGeocoding(true);
		try {
			const result = await geocodeAddressAction(query);
			if (!result.ok) {
				toast.error(result.error);
				return;
			}
			setForm((prev) => ({
				...prev,
				homeLatitude: String(result.result.latitude),
				homeLongitude: String(result.result.longitude),
			}));
			toast.success("Home pin found from your address");
		} finally {
			setIsGeocoding(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!session?.user?.id) return;

		const error = validateForm(form);
		if (error) {
			toast.error(error);
			return;
		}

		setIsSaving(true);
		try {
			await saveDonorProfile(session.user.id, {
				name: form.name.trim(),
				profile: {
					bloodGroup: form.bloodGroup,
					dateOfBirth: form.dateOfBirth,
					homeAddress: form.homeAddress.trim() || undefined,
					state: form.state.trim() || undefined,
					lga: form.lga.trim() || undefined,
					homeLatitude: Number(form.homeLatitude),
					homeLongitude: Number(form.homeLongitude),
					isAvailable: form.isAvailable,
				},
			});
			await queryClient.invalidateQueries({
				queryKey: ["donor-dashboard", session.user.id],
			});
			toast.success(
				donorCode
					? "Profile saved."
					: "Profile created. Your donor code is ready.",
			);
		} catch (err) {
			toast.error(
				err instanceof Error
					? err.message
					: "Failed to save profile. Please try again.",
			);
		} finally {
			setIsSaving(false);
		}
	};

	if (sessionLoading || userLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!session?.user) {
		return (
			<p className="text-sm text-muted-foreground">Sign in to view your profile</p>
		);
	}

	return (
		<div className="mx-auto w-full max-w-4xl space-y-8">
			<div className="space-y-3">
				<Link
					href="/donor"
					className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft className="h-3.5 w-3.5" />
					Back to dashboard
				</Link>
				<DashboardGreeting
					title="Donor Profile"
					subtitle="Keep your details up to date so hospitals can match you with nearby emergencies."
				/>
			</div>

			<DonorCodeCard
				donorCode={donorCode}
				verificationStatus={verificationStatus}
			/>
			<ScreeningExplainer status={verificationStatus} />
			<CompletionCard done={completion.done} total={completion.total} />

			<form onSubmit={handleSubmit} className="space-y-6">
				<Section
					title="Personal details"
					description="How hospitals identify and reach you."
				>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Field label="Full Name" required>
							<Input
								type="text"
								value={form.name}
								onChange={setText("name")}
								placeholder="e.g. David Adebayo"
								autoComplete="name"
							/>
						</Field>
						<Field label="Date of Birth" required>
							<Input
								type="date"
								value={form.dateOfBirth}
								onChange={setText("dateOfBirth")}
								max={new Date().toISOString().slice(0, 10)}
							/>
						</Field>
					</div>
					<Field label="Email">
						<Input type="email" value={session.user.email ?? ""} disabled />
					</Field>
				</Section>

				<Section
					title="Donation profile"
					description="Used to match you with nearby emergency requests."
				>
					<Field label="Blood Group" required>
						<SelectGrid
							options={BLOOD_GROUP_OPTIONS}
							value={form.bloodGroup}
							onChange={setChoice("bloodGroup")}
							columns={4}
						/>
					</Field>
					<div className="rounded-xl border border-border bg-muted/50 p-4">
						<div className="flex items-center justify-between gap-3">
							<div>
								<p className="text-sm font-semibold text-foreground">
									Available to donate
								</p>
								<p className="text-xs text-muted-foreground">
									Turn off when you need a break. You stay visible but
									will not be matched.
								</p>
							</div>
							<button
								type="button"
								role="switch"
								aria-checked={form.isAvailable}
								aria-label="Available to donate"
								onClick={() =>
									setForm((prev) => ({
										...prev,
										isAvailable: !prev.isAvailable,
									}))
								}
								className={cn(
									"relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors",
									form.isAvailable ? "bg-brand" : "bg-muted-foreground/30",
								)}
							>
								<span
									className={cn(
										"absolute top-1 size-5 rounded-full bg-white shadow transition-all",
										form.isAvailable ? "left-6" : "left-1",
									)}
								/>
							</button>
						</div>
					</div>
				</Section>

				<Section
					title="Home location"
					description="Your home pin powers distance matching. State plus coordinates are required."
				>
					<Field label="Home Address" hint="Street and area. The map pin below is what matching uses.">
						<Input
							type="text"
							value={form.homeAddress}
							onChange={setText("homeAddress")}
							placeholder="e.g. 14 Allen Avenue, Ikeja"
							autoComplete="street-address"
						/>
					</Field>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Field label="State" required>
							<Input
								type="text"
								value={form.state}
								onChange={setText("state")}
								placeholder="e.g. Lagos"
								autoComplete="address-level1"
							/>
						</Field>
						<Field label="LGA">
							<Input
								type="text"
								value={form.lga}
								onChange={setText("lga")}
								placeholder="e.g. Ikeja"
								autoComplete="address-level2"
							/>
						</Field>
						<Field label="Latitude" required>
							<Input
								type="number"
								inputMode="decimal"
								step="any"
								min={-90}
								max={90}
								value={form.homeLatitude}
								onChange={setText("homeLatitude")}
								placeholder="e.g. 6.5244"
							/>
						</Field>
						<Field label="Longitude" required>
							<Input
								type="number"
								inputMode="decimal"
								step="any"
								min={-180}
								max={180}
								value={form.homeLongitude}
								onChange={setText("homeLongitude")}
								placeholder="e.g. 3.3792"
							/>
						</Field>
					</div>
					<div className="flex flex-col gap-2 sm:flex-row">
						<Button
							type="button"
							variant="outline"
							onClick={handleUseMyLocation}
							disabled={isLocating}
							className="flex-1"
						>
							<Crosshair className="h-4 w-4" />
							{isLocating ? "Reading location..." : "Use my current location"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={handleGeocodeFromAddress}
							disabled={isGeocoding}
							className="flex-1"
						>
							<Search className="h-4 w-4" />
							{isGeocoding ? "Finding pin..." : "Find pin from address"}
						</Button>
					</div>
					{form.homeLatitude.trim() !== "" &&
						form.homeLongitude.trim() !== "" ? (
						<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
							<MapPin className="h-3.5 w-3.5" />
							Home pin set at {form.homeLatitude}, {form.homeLongitude}
							{hasLastKnown
								? ". Your last-known location also updates automatically when you open the app with location permission."
								: ". Open the app with location permission and your live position updates automatically."}
						</p>
					) : (
						<div className="rounded-xl border border-dashed border-border bg-muted/50 px-4 py-5 text-center">
							<p className="text-sm font-semibold text-foreground">
								No home pin yet
							</p>
							<p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
								Enter coordinates manually, use your current location, or
								find the pin from your address above. Matching needs a
								home pin.
							</p>
						</div>
					)}
				</Section>

				<Button
					type="submit"
					disabled={isSaving}
					className="w-full rounded-2xl py-6 text-sm font-medium"
				>
					{isSaving ? "Saving..." : donorCode ? "Save Profile" : "Create Profile"}
				</Button>
			</form>

			<Section
				title="Communication preferences"
				description="Choose which optional messages you receive from BioMatch."
			>
				<MarketingConsentToggle />
			</Section>

			<Section
				title="Walkthrough"
				description="Replay the first-time tour of the donor app."
			>
				<ReplayWalkthroughButton audience="donor" />
			</Section>

			<PhoneVerification />

			<DeleteAccountSection />
		</div>
	);
}
