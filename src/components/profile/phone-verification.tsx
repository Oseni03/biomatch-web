"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldAlert, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
	getPhoneVerificationState,
	requestPhoneOtp,
	setPhoneNumber,
} from "@/servers/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function verifyErrorMessage(error: { code?: string; message?: string } | null): string {
	if (!error) return "Verification failed. Try again.";
	switch (error.code) {
		case "INVALID_OTP":
			return "That code is incorrect. Check the SMS and try again.";
		case "OTP_EXPIRED":
		case "OTP_NOT_FOUND":
			return "That code has expired. Request a new one.";
		case "TOO_MANY_ATTEMPTS":
			return "Too many wrong attempts. Request a new code.";
		case "PHONE_NUMBER_EXIST":
			return "This number is already registered to another account.";
		default:
			if (error.code === "TOO_MANY_REQUESTS") {
				return "Too many requests. Wait a minute and try again.";
			}
			return error.message ?? "Verification failed. Try again.";
	}
}

export function PhoneVerification() {
	const { data: session, isPending: sessionLoading } = authClient.useSession();
	const userId = session?.user?.id ?? null;

	const [loaded, setLoaded] = useState(false);
	const [phone, setPhone] = useState("");
	const [savedPhone, setSavedPhone] = useState<string | null>(null);
	const [verified, setVerified] = useState(false);
	const [editing, setEditing] = useState(false);
	const [step, setStep] = useState<"entry" | "code">("entry");
	const [code, setCode] = useState("");
	const [busy, setBusy] = useState<null | "send" | "verify">(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!userId) return;
		let cancelled = false;
		getPhoneVerificationState(userId)
			.then((state) => {
				if (cancelled) return;
				setPhone(state.phoneNumber ?? "");
				setSavedPhone(state.phoneNumber);
				setVerified(state.phoneNumberVerified ?? false);
				setStep(state.phoneNumber && !state.phoneNumberVerified ? "code" : "entry");
				setLoaded(true);
			})
			.catch(() => {
				if (!cancelled) setLoaded(true);
			});
		return () => {
			cancelled = true;
		};
	}, [userId]);

	const handleSendCode = async () => {
		if (!userId || busy) return;
		setBusy("send");
		setError(null);
		try {
			const saved = await setPhoneNumber(userId, phone);
			await requestPhoneOtp(userId);
			setSavedPhone(saved.phoneNumber);
			setVerified(false);
			setEditing(false);
			setStep("code");
			setCode("");
			toast.success(`Code sent to ${saved.phoneNumber}`);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Could not send the code";
			setError(message);
		} finally {
			setBusy(null);
		}
	};

	const handleVerify = async () => {
		if (!savedPhone || busy) return;
		setBusy("verify");
		setError(null);
		try {
			const { data, error: verifyError } = await authClient.phoneNumber.verify({
				phoneNumber: savedPhone,
				code: code.trim(),
				disableSession: true,
			});
			if (verifyError || !data?.status) {
				setError(verifyErrorMessage(verifyError));
				return;
			}
			setVerified(true);
			setEditing(false);
			setStep("entry");
			setCode("");
			toast.success("Phone number verified");
		} finally {
			setBusy(null);
		}
	};

	const handleResend = async () => {
		if (!userId || busy) return;
		setBusy("send");
		setError(null);
		try {
			await requestPhoneOtp(userId);
			setCode("");
			toast.success(`Code sent to ${savedPhone}`);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Could not resend the code";
			setError(message);
		} finally {
			setBusy(null);
		}
	};

	return (
		<div className="rounded-2xl border border-border bg-card p-6">
			<div className="flex items-center gap-2">
				<Smartphone className="h-4 w-4 text-brand" />
				<h2 className="text-sm font-bold text-foreground">Phone verification</h2>
			</div>
			<p className="mt-1 text-xs leading-relaxed text-muted-foreground">
				Verification is optional — you can use the app and be matched
				without it. A verified number lets BioMatch reach you by SMS
				and WhatsApp when urgent blood is needed near you.
			</p>

			{!loaded || sessionLoading ? (
				<div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
					<Loader2 className="h-4 w-4 animate-spin" />
					Loading phone status...
				</div>
			) : verified && !editing ? (
				<div className="mt-4 flex flex-wrap items-center gap-3">
					<span className="inline-flex items-center gap-1.5 rounded-full border border-status-ok/40 bg-status-ok-bg px-3 py-1 text-xs font-semibold text-status-ok">
						<ShieldCheck className="h-3.5 w-3.5" />
						Verified
					</span>
					<span className="text-sm font-semibold text-foreground">{savedPhone}</span>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => {
							setPhone(savedPhone ?? "");
							setEditing(true);
							setStep("entry");
							setError(null);
						}}
					>
						Change number
					</Button>
				</div>
			) : step === "code" && savedPhone ? (
				<div className="mt-4 space-y-3">
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<ShieldAlert className="h-3.5 w-3.5 text-status-low" />
						{savedPhone} is unverified. Enter the 6-digit code sent by SMS.
					</div>
					<div className="flex flex-col gap-2 sm:flex-row">
						<Input
							type="text"
							inputMode="numeric"
							autoComplete="one-time-code"
							maxLength={6}
							value={code}
							onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
							placeholder="6-digit code"
							className="sm:max-w-40"
						/>
						<Button
							type="button"
							onClick={handleVerify}
							disabled={busy !== null || code.trim().length !== 6}
						>
							{busy === "verify" ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Verifying...
								</>
							) : (
								"Verify code"
							)}
						</Button>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={handleResend}
							disabled={busy !== null}
						>
							{busy === "send" ? "Sending..." : "Resend code"}
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => {
								setPhone(savedPhone);
								setStep("entry");
								setError(null);
							}}
						>
							Use a different number
						</Button>
					</div>
					{error ? <p className="text-xs font-medium text-brand">{error}</p> : null}
				</div>
			) : (
				<div className="mt-4 space-y-3">
					{savedPhone && !verified && !editing ? (
						<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
							<ShieldAlert className="h-3.5 w-3.5 text-status-low" />
							{savedPhone} is not verified yet.
						</div>
					) : null}
					<div className="flex flex-col gap-2 sm:flex-row">
						<Input
							type="tel"
							autoComplete="tel"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							placeholder="e.g. +2348012345678"
							className="sm:max-w-64"
						/>
						<Button
							type="button"
							onClick={handleSendCode}
							disabled={busy !== null || phone.trim() === ""}
						>
							{busy === "send" ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Sending...
								</>
							) : savedPhone ? (
								"Change number and send code"
							) : (
								"Add number and send code"
							)}
						</Button>
					</div>
					{error ? <p className="text-xs font-medium text-brand">{error}</p> : null}
				</div>
			)}
		</div>
	);
}
