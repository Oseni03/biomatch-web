"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Mail, MapPin, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthInput } from "@/components/auth/auth-input";
import { PasswordField } from "@/components/auth/password-field";
import { AUTH_STATS } from "@/components/auth/auth-constants";
import { authClient } from "@/lib/auth-client";
import { BloodDropIcon } from "@/components/brand/blood-drop-icon";
import { Wordmark } from "@/components/brand/wordmark";
import {
	ConsentChoicesFields,
	EMPTY_CONSENT_CHOICES,
	requiredConsentsAccepted,
	type ConsentChoices,
} from "@/components/consent/consent-choices";
import { acceptConsents } from "@/servers/consent";

function isInNigeria(lat: number, lng: number): boolean {
	return lat >= 3.5 && lat <= 14.5 && lng >= 2.5 && lng <= 15.0;
}

function getCurrentPosition(options?: PositionOptions) {
	return new Promise<GeolocationPosition>((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(resolve, reject, options);
	});
}

function getLocationErrorMessage(err: unknown): string {
	if (err && typeof err === "object" && "code" in err) {
		switch ((err as GeolocationPositionError).code) {
			case 1:
				return "Location access was denied. Enable location permission in your browser settings and try again.";
			case 2:
				return "Your location couldn't be determined. Check your connection or GPS and try again.";
			case 3:
				return "Getting your location timed out. Please try again.";
		}
	}
	return "Something went wrong while getting your location.";
}

function slugifyHospital(name: string): string {
	const base =
		name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "")
			.slice(0, 40) || "hospital";
	return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

function errorMessage(value: unknown, fallback: string): string {
	if (typeof value === "string") return value;
	return (value as { message?: string })?.message ?? fallback;
}

function SignupContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const isHospital = searchParams.get("role") === "hospital";
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [hospitalName, setHospitalName] = useState("");
	const [registrationNumber, setRegistrationNumber] = useState("");
	const [phone, setPhone] = useState("");
	const [address, setAddress] = useState("");
	const [state, setStateValue] = useState("");
	const [lga, setLga] = useState("");
	const [latitude, setLatitude] = useState("");
	const [longitude, setLongitude] = useState("");
	const [consents, setConsents] = useState<ConsentChoices>(
		EMPTY_CONSENT_CHOICES,
	);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	if (isHospital) {
		return (
			<HospitalSignupForm
				routerPush={router.push}
				hospitalName={hospitalName}
				setHospitalName={setHospitalName}
				registrationNumber={registrationNumber}
				setRegistrationNumber={setRegistrationNumber}
				name={name}
				setName={setName}
				email={email}
				setEmail={setEmail}
				password={password}
				setPassword={setPassword}
				phone={phone}
				setPhone={setPhone}
				address={address}
				setAddress={setAddress}
				state={state}
				setStateValue={setStateValue}
				lga={lga}
				setLga={setLga}
				latitude={latitude}
				setLatitude={setLatitude}
				longitude={longitude}
				setLongitude={setLongitude}
				consents={consents}
				setConsents={setConsents}
				error={error}
				setError={setError}
				isLoading={isLoading}
				setIsLoading={setIsLoading}
			/>
		);
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!name.trim() || !email.trim() || !password) {
			setError("Please complete all required fields");
			return;
		}
		if (password.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}
		if (!requiredConsentsAccepted(consents)) {
			setError(
				"Please accept the Terms of Service, Privacy Policy and data processing consent to create your account",
			);
			return;
		}

		setIsLoading(true);

		const { error: signUpError } = await authClient.signUp.email({
			email: email.trim(),
			password,
			name: name.trim(),
		});

		if (signUpError) {
			setError(
				typeof signUpError === "string"
					? signUpError
					: (signUpError as { message?: string })?.message ?? "Account creation failed",
			);
			setIsLoading(false);
			return;
		}

		try {
			await acceptConsents({ marketing: consents.marketing });
		} catch {
			// No session yet (e.g. email verification pending): the consent
			// gate redirects to the re-consent screen on the next visit.
		}

		const callbackUrl = searchParams.get("callbackUrl");
		const next =
			callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/donor";
		router.push(`/auth/verify-phone?next=${encodeURIComponent(next)}`);
	};

	return (
		<AuthShell
			eyebrow="Join The Network"
			headline={
				<>
					Every match starts
					<br />
					with <span className="italic text-brand">one signup.</span>
				</>
			}
			description="Create your account with email and password. You will complete your donor profile in the next step."
			stats={AUTH_STATS}
		>
			<Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2.5">
				<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-brand transition-transform duration-300 hover:scale-105">
					<BloodDropIcon className="size-5" />
				</div>
				<Wordmark size="lg" className="text-white" />
			</Link>

			<AuthForm
				title="Join the Network"
				subtitle="Tell us who you are so hospitals can reach you in an emergency."
				error={error}
				onSubmit={handleSubmit}
				footer={
					<div className="mt-8 border-t border-border pt-6 text-center">
						<p className="text-sm text-muted-foreground">
							Already registered?{" "}
							<Link
								href="/auth/login"
								className="font-medium text-brand transition-colors hover:text-brand-hover"
							>
								Sign In
							</Link>
						</p>
					</div>
				}
			>
				<AuthInput
					id="signup-name"
					label="Full Name"
					requiredIndicator
					leftIcon={<User className="h-4 w-4" />}
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="e.g. David Adebayo"
					autoComplete="name"
				/>
				<AuthInput
					id="signup-email"
					label="Email Address"
					requiredIndicator
					leftIcon={<Mail className="h-4 w-4" />}
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="you@example.com"
					autoComplete="email"
				/>
				<PasswordField
					id="signup-password"
					label="Password"
					requiredIndicator
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="At least 8 characters"
					autoComplete="new-password"
				/>
				<ConsentChoicesFields
					value={consents}
					onChange={setConsents}
					idPrefix="signup"
				/>
				<Button
					type="submit"
					disabled={isLoading}
					className="w-full rounded-2xl py-6 text-sm font-medium"
				>
					{isLoading ? "Creating Account..." : "Create Account"}
				</Button>
			</AuthForm>
		</AuthShell>
	);
}

type HospitalFormProps = {
	routerPush: (href: string) => void;
	hospitalName: string;
	setHospitalName: (v: string) => void;
	registrationNumber: string;
	setRegistrationNumber: (v: string) => void;
	name: string;
	setName: (v: string) => void;
	email: string;
	setEmail: (v: string) => void;
	password: string;
	setPassword: (v: string) => void;
	phone: string;
	setPhone: (v: string) => void;
	address: string;
	setAddress: (v: string) => void;
	state: string;
	setStateValue: (v: string) => void;
	lga: string;
	setLga: (v: string) => void;
	latitude: string;
	setLatitude: (v: string) => void;
	longitude: string;
	setLongitude: (v: string) => void;
	consents: ConsentChoices;
	setConsents: (v: ConsentChoices) => void;
	error: string;
	setError: (v: string) => void;
	isLoading: boolean;
	setIsLoading: (v: boolean) => void;
};

function HospitalSignupForm({
	routerPush,
	hospitalName,
	setHospitalName,
	registrationNumber,
	setRegistrationNumber,
	name,
	setName,
	email,
	setEmail,
	password,
	setPassword,
	phone,
	setPhone,
	address,
	setAddress,
	state,
	setStateValue,
	lga,
	setLga,
	latitude,
	setLatitude,
	longitude,
	setLongitude,
	consents,
	setConsents,
	error,
	setError,
	isLoading,
	setIsLoading,
}: HospitalFormProps) {
	const [isLocating, setIsLocating] = useState(false);
	const pinSet = latitude.trim() !== "" && longitude.trim() !== "";

	const handleUseMyLocation = async () => {
		setError("");

		if (!("geolocation" in navigator)) {
			setError("Geolocation is not supported by this browser");
			return;
		}

		setIsLocating(true);
		try {
			const position = await getCurrentPosition({
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 0,
			});

			setLatitude(position.coords.latitude.toFixed(6));
			setLongitude(position.coords.longitude.toFixed(6));
		} catch (err) {
			setError(getLocationErrorMessage(err));
		} finally {
			setIsLocating(false);
		}
	};

	const handleHospitalSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (
			!hospitalName.trim() ||
			!registrationNumber.trim() ||
			!name.trim() ||
			!email.trim() ||
			!password ||
			!address.trim() ||
			!state.trim()
		) {
			setError("Please complete all required fields");
			return;
		}
		if (password.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}
		if (!requiredConsentsAccepted(consents)) {
			setError(
				"Please accept the Terms of Service, Privacy Policy and data processing consent to register your hospital",
			);
			return;
		}

		// Testing accommodation: outside production the pin is optional and
		// falls back to Lagos test coordinates so signup can be exercised
		// without geolocation. Production still requires a real pin.
		const skippingPin = !pinSet && process.env.NODE_ENV !== "production";
		if (!pinSet && !skippingPin) {
			setError("Set your hospital's location");
			return;
		}
		const lat = pinSet ? Number(latitude) : 6.5244;
		const lng = pinSet ? Number(longitude) : 3.3792;
		if (pinSet && (!Number.isFinite(lat) || !Number.isFinite(lng) || !isInNigeria(lat, lng))) {
			setError(
				"Hospital location must be within Nigeria — use your current location or enter valid coordinates",
			);
			return;
		}

		setIsLoading(true);

		const { error: signUpError } = await authClient.signUp.email({
			email: email.trim(),
			password,
			name: name.trim(),
		});
		if (signUpError) {
			setError(errorMessage(signUpError, "Account creation failed"));
			setIsLoading(false);
			return;
		}

		const organizationDetails = {
			name: hospitalName.trim(),
			officialEmail: email.trim(),
			registrationNumber: registrationNumber.trim(),
			phone: phone.trim() || undefined,
			address: address.trim(),
			state: state.trim(),
			lga: lga.trim() || undefined,
			latitude: lat,
			longitude: lng,
		};
		const created = await authClient.organization.create({
			...organizationDetails,
			slug: slugifyHospital(hospitalName),
		});
		if (created.error) {
			setError(
				`${errorMessage(created.error, "Hospital registration failed")} Your account was created — please sign in and try registering the hospital again.`,
			);
			setIsLoading(false);
			return;
		}

		try {
			await acceptConsents({ marketing: consents.marketing });
		} catch {
			// No session yet: the consent gate redirects to re-consent on next visit.
		}

		routerPush("/hospital");
	};

	return (
		<AuthShell
			eyebrow="Hospital Registration"
			headline={
				<>
					Register your hospital
					<br />
					with <span className="italic text-brand">one signup.</span>
				</>
			}
			description="Create your hospital desk account. Your registration enters verification before emergency dispatch is enabled."
			stats={AUTH_STATS}
		>
			<Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2.5">
				<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-brand transition-transform duration-300 hover:scale-105">
					<BloodDropIcon className="size-5" />
				</div>
				<Wordmark size="lg" className="text-white" />
			</Link>

			<AuthForm
				title="Register Hospital"
				subtitle="Official hospital details so BioMatch can verify your facility."
				error={error}
				onSubmit={handleHospitalSubmit}
				footer={
					<div className="mt-8 border-t border-border pt-6 text-center">
						<p className="text-sm text-muted-foreground">
							Already registered?{" "}
							<Link
								href="/auth/login"
								className="font-medium text-brand transition-colors hover:text-brand-hover"
							>
								Sign In
							</Link>
						</p>
					</div>
				}
			>
				<AuthInput
					id="signup-hospital-name"
					label="Hospital Name"
					requiredIndicator
					leftIcon={<Building2 className="h-4 w-4" />}
					value={hospitalName}
					onChange={(e) => setHospitalName(e.target.value)}
					placeholder="e.g. Lagos University Teaching Hospital"
					autoComplete="organization"
				/>
				<AuthInput
					id="signup-hospital-reg-number"
					label="Registration Number"
					requiredIndicator
					value={registrationNumber}
					onChange={(e) => setRegistrationNumber(e.target.value)}
					placeholder="e.g. CAC/RC-123456"
					autoComplete="off"
				/>
				<AuthInput
					id="signup-contact-name"
					label="Contact Person"
					requiredIndicator
					leftIcon={<User className="h-4 w-4" />}
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="e.g. Dr Adaeze Okonkwo"
					autoComplete="name"
				/>
				<AuthInput
					id="signup-hospital-email"
					label="Official Hospital Email"
					requiredIndicator
					leftIcon={<Mail className="h-4 w-4" />}
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="desk@hospital.org"
					autoComplete="email"
				/>
				<PasswordField
					id="signup-hospital-password"
					label="Password"
					requiredIndicator
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="At least 8 characters"
					autoComplete="new-password"
				/>
				<AuthInput
					id="signup-hospital-phone"
					label="Phone (optional)"
					leftIcon={<Phone className="h-4 w-4" />}
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
					placeholder="e.g. +2348012345678"
					autoComplete="tel"
					hint="Staff verify their personal number later in profile settings to receive SMS alerts."
				/>
				<AuthInput
					id="signup-hospital-address"
					label="Hospital Address"
					requiredIndicator
					leftIcon={<MapPin className="h-4 w-4" />}
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					placeholder="Street address and area"
					autoComplete="street-address"
				/>
				<div className="grid grid-cols-2 gap-4">
					<AuthInput
						id="signup-hospital-state"
						label="State"
						requiredIndicator
						value={state}
						onChange={(e) => setStateValue(e.target.value)}
						placeholder="e.g. Lagos"
						autoComplete="address-level1"
					/>
					<AuthInput
						id="signup-hospital-lga"
						label="LGA (optional)"
						value={lga}
						onChange={(e) => setLga(e.target.value)}
						placeholder="e.g. Surulere"
						autoComplete="address-level2"
					/>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<AuthInput
						id="signup-hospital-latitude"
						label="Latitude"
						value={latitude}
						onChange={(e) => setLatitude(e.target.value)}
						placeholder="e.g. 6.5244"
						inputMode="decimal"
					/>
					<AuthInput
						id="signup-hospital-longitude"
						label="Longitude"
						value={longitude}
						onChange={(e) => setLongitude(e.target.value)}
						placeholder="e.g. 3.3792"
						inputMode="decimal"
					/>
				</div>
				<Button
					type="button"
					variant="outline"
					onClick={handleUseMyLocation}
					disabled={isLocating}
					className="w-full rounded-2xl"
				>
					<MapPin className="h-4 w-4" />
					{isLocating ? "Locating..." : "Use my current location"}
				</Button>
				{pinSet ? (
					<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<MapPin className="h-3.5 w-3.5" />
						Location pin set at {latitude.trim()}, {longitude.trim()}
					</p>
				) : (
					<div className="rounded-xl border border-dashed border-border bg-muted/50 px-4 py-4 text-center">
						<p className="text-sm font-semibold text-foreground">
							No location pin yet
						</p>
						<p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
							Use your current location, or enter coordinates
							manually. You can skip this while testing — a Lagos
							test pin will be used.
						</p>
					</div>
				)}
				<ConsentChoicesFields
					value={consents}
					onChange={setConsents}
					idPrefix="signup-hospital"
				/>
				<Button
					type="submit"
					disabled={isLoading}
					className="w-full rounded-2xl py-6 text-sm font-medium"
				>
					{isLoading ? "Registering Hospital..." : "Register Hospital"}
				</Button>
			</AuthForm>
		</AuthShell>
	);
}

export default function SignupPage() {
	return (
		<Suspense fallback={null}>
			<SignupContent />
		</Suspense>
	);
}
