"use client";

import { useState, useEffect, useCallback } from "react";
import {
	Heart,
	MapPin,
	Phone,
	Bell,
	Award,
	CheckCircle,
	Clock,
	Calendar,
	Sparkles,
	Check,
	X,
	Navigation,
	Activity,
	ChevronRight,
	Shield,
	ThumbsDown,
	Percent,
	Droplet,
	Wallet,
	Loader2,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useDonorDashboard } from "@/hooks/use-donor-dashboard";
import { getAllHospitalBanks } from "@/servers/hospital";
import { updateUserProfile } from "@/servers/user";
import { getEligibility, ELIGIBILITY_DAYS } from "@/lib/eligibility";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useDonorAlerts } from "@/hooks/use-emergency-requests";
import { respondToAlert, updateAlertStatus } from "@/servers/emergency";
import type {
	EmergencyMatchRequest,
	DonationRecord,
	DonorStatus,
} from "@/lib/donor-types";

const BLOOD_GROUP_MAP: Record<string, string> = {
	A_PLUS: "A+",
	A_MINUS: "A-",
	B_PLUS: "B+",
	B_MINUS: "B-",
	AB_PLUS: "AB+",
	AB_MINUS: "AB-",
	O_PLUS: "O+",
	O_MINUS: "O-",
};

function displayBloodGroup(bg: string | null | undefined): string {
	if (!bg) return "Unknown";
	return BLOOD_GROUP_MAP[bg] ?? bg;
}

const HOSPITALS_FOR_HISTORY = [
	"Ikeja General Hospital",
	"Lagos State University Teaching Hospital (LASUTH)",
	"Federal Medical Centre, Ebute Metta",
	"Red Cross Emergency Clinic",
];

export default function DonorDashboardPage() {
	const { data: session, isPending: sessionLoading } =
		authClient.useSession();

	const {
		data: user,
		isLoading: userLoading,
		error: userError,
	} = useDonorDashboard();

	const { data: banks } = useQuery({
		queryKey: ["hospital-banks"],
		queryFn: () => getAllHospitalBanks(),
	});

	const bloodType = displayBloodGroup(user?.bloodGroup);
	const lastDonationDate = user?.lastDonationDate
		? new Date(user.lastDonationDate).toISOString().slice(0, 10)
		: null;
	const eligibility = getEligibility(lastDonationDate);
	const walletData = user?.wallet;
	const completedCount = walletData?.lifetimeDonations ?? 0;
	const points = walletData?.points ?? 0;

	const [donorStatus, setDonorStatus] = useState<DonorStatus>("available");
	const [donorLocation, setDonorLocation] = useState<string>(
		user?.location || "Ikeja, Lagos",
	);
	const [maxRadius, setMaxRadius] = useState<number>(15);
	const [smsFallbackEnabled, setSmsFallbackEnabled] = useState<boolean>(true);
	const [settingsSuccess, setSettingsSuccess] = useState<string>("");
	const [lastDonationDateInput, setLastDonationDateInput] = useState<string>(
		lastDonationDate ?? "",
	);
	const { data: alerts } = useDonorAlerts(session?.user?.id);

	const requests: EmergencyMatchRequest[] = (alerts ?? [])
		.filter(
			(a) =>
				a.request.status === "pending" ||
				a.request.status === "matched",
		)
		.map((a) => ({
			id: a.id,
			hospitalName: a.request.hospital.name,
			location: a.request.hospital.location ?? "Unknown",
			bloodType: displayBloodGroup(a.request.bloodGroup),
			requiredPints: a.request.unitsNeeded,
			contactPhone: "N/A",
			urgency:
				a.request.urgencyLevel === "critical" ? "critical" : "high",
			timestamp: new Date(a.request.createdAt).toISOString(),
			status: a.request.status as "pending" | "matched",
		}));

	const donorApprovedRequests = (alerts ?? [])
		.filter(
			(a) =>
				a.status === "accepted" ||
				a.status === "en_route" ||
				a.status === "arrived" ||
				a.status === "completed",
		)
		.map((a) => a.id);
	const [activeTrackingId, setActiveTrackingId] = useState<string | null>(
		null,
	);
	const [trackingProgress, setTrackingProgress] = useState(0);
	const [trackingStatus, setTrackingStatus] = useState<
		"accepted" | "en_route" | "arrived"
	>("accepted");
	const [etaMinutes, setEtaMinutes] = useState(15);
	const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

	useEffect(() => {
		if (user?.location) setDonorLocation(user.location);
		if (lastDonationDate) setLastDonationDateInput(lastDonationDate);
		if (user?.isActive === false) setDonorStatus("inactive");
	}, [user, lastDonationDate]);

	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (activeTrackingId) {
			timer = setInterval(() => {
				setTrackingProgress((prev) => {
					if (prev >= 100) {
						clearInterval(timer);
						setTrackingStatus("arrived");
						setEtaMinutes(0);
						setIsSuccessModalOpen(true);
						return 100;
					}
					const next = prev + 5;
					if (next >= 15 && next < 80) {
						setTrackingStatus("en_route");
						setEtaMinutes(
							Math.max(1, Math.round(15 * (1 - next / 100))),
						);
					} else if (next >= 80) {
						setTrackingStatus("arrived");
						setEtaMinutes(0);
					}
					return next;
				});
			}, 1000);
		}
		return () => clearInterval(timer);
	}, [activeTrackingId]);

	const deferralPercent = Math.min(
		100,
		Math.floor(((56 - eligibility.daysRemaining) / 56) * 100),
	);

	const getHmoTier = () => {
		if (completedCount === 0)
			return {
				name: "Inactive",
				level: 0,
				desc: "Donate once to activate your Basic coverage",
			};
		if (completedCount < 3)
			return {
				name: "Basic Plan Activated",
				level: 1,
				desc: "Covers standard consultation and primary emergencies",
			};
		return {
			name: "Premium Gold Plan",
			level: 2,
			desc: "Covers comprehensive surgeries, medication, and fully upgraded HMO coverage",
		};
	};

	const hmoTier = getHmoTier();

	const handleSaveSettings = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!session?.user?.id) return;
			try {
				await updateUserProfile(session.user.id, {
					location: donorLocation || undefined,
					isActive: donorStatus !== "inactive",
				});
				setSettingsSuccess(
					"Preferences updated successfully! Match filters updated in real-time.",
				);
				setTimeout(() => setSettingsSuccess(""), 4000);
				toast.success("Settings saved");
			} catch {
				toast.error("Failed to save settings");
			}
		},
		[session?.user?.id, donorLocation, donorStatus],
	);

	const queryClient = useQueryClient();

	const handleRespond = useCallback(
		async (reqId: string) => {
			setActiveTrackingId(reqId);
			setTrackingProgress(0);
			setTrackingStatus("accepted");
			setEtaMinutes(15);
			try {
				await respondToAlert(reqId, "accepted");
				queryClient.invalidateQueries({
					queryKey: ["donor-alerts"],
				});
			} catch {
				toast.error("Failed to accept alert");
			}
		},
		[queryClient],
	);

	const handleManualComplete = useCallback(async () => {
		if (activeTrackingId) {
			try {
				await updateAlertStatus(activeTrackingId, "completed");
				queryClient.invalidateQueries({
					queryKey: ["donor-alerts"],
				});
			} catch {
				toast.error("Failed to update donation status");
			}
		}
		setCompletedCountLocal((prev) => prev + 1);
		setActiveTrackingId(null);
		setTrackingProgress(0);
		const today = new Date().toISOString().split("T")[0];
		setLastDonationDateInput(today);
		setIsSuccessModalOpen(false);
		toast.success("Donation recorded. Deferral period reset.");
	}, [activeTrackingId, queryClient]);

	const generateHistory = useCallback((): DonationRecord[] => {
		const list: DonationRecord[] = [];
		for (let i = 0; i < completedCount; i++) {
			const dateOffset = (i + 1) * 60;
			const date = new Date();
			date.setDate(date.getDate() - dateOffset);
			list.push({
				id: `rec-${i}`,
				date: date.toISOString().split("T")[0],
				hospitalName:
					HOSPITALS_FOR_HISTORY[i % HOSPITALS_FOR_HISTORY.length],
				bloodType,
				status: "verified",
				pints: 1,
			});
		}
		return list;
	}, [completedCount, bloodType]);

	const donationRecords = generateHistory();
	const [completedCountLocal, setCompletedCountLocal] =
		useState(completedCount);
	const activeRequest = requests.find((r) => r.id === activeTrackingId);

	useEffect(() => {
		setCompletedCountLocal(completedCount);
	}, [completedCount]);

	const isLoading = sessionLoading || userLoading;

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin text-gray-400" />
			</div>
		);
	}

	if (userError) {
		toast.error("Failed to load dashboard data");
	}

	if (!session?.user) {
		return (
			<p className="text-sm text-gray-500">
				Sign in to view the donor dashboard
			</p>
		);
	}

	return (
		<div className="space-y-8">
			{activeTrackingId && activeRequest && (
				<Card className="border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/10 rounded-3xl p-6 shadow-md relative overflow-hidden animate-in slide-in-from-top-4 duration-300">
					<div className="absolute right-0 top-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-red-100 dark:border-red-950">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white relative animate-pulse">
								<Navigation className="h-6 w-6" />
							</div>
							<div>
								<Badge className="bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] uppercase font-semibold">
									Active Emergency Mission
								</Badge>
								<h3 className="font-bold text-lg mt-1">
									{activeRequest.hospitalName}
								</h3>
								<p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
									<MapPin className="h-3 w-3" />{" "}
									{activeRequest.location}
								</p>
							</div>
						</div>

						<div className="text-right w-full md:w-auto">
							<span className="text-xs font-mono text-gray-400 block uppercase">
								Estimated Arrival
							</span>
							<span className="text-3xl font-bold font-mono text-red-600 dark:text-red-400">
								{etaMinutes > 0
									? `${etaMinutes} mins`
									: "Arrived"}
							</span>
						</div>
					</div>

					<div className="py-6">
						<div className="flex justify-between items-center text-xs mb-2">
							<span className="font-mono text-gray-400 uppercase">
								Transit Status:
							</span>
							<span className="font-semibold uppercase text-red-600 dark:text-red-400 flex items-center gap-1.5">
								<span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
								{trackingStatus === "accepted"
									? "Awaiting Departure"
									: trackingStatus === "en_route"
										? "En Route"
										: "Arrived and Checking In"}
							</span>
						</div>

						<div className="relative w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
							<div
								className="absolute left-0 top-0 h-full bg-red-600 rounded-full transition-all duration-1000 ease-linear"
								style={{ width: `${trackingProgress}%` }}
							/>
						</div>

						<div className="flex justify-between text-[10px] font-mono text-gray-400 mt-2">
							<span>DEPARTED</span>
							<span>
								IN TRANSIT ({donorLocation.split(",")[0]})
							</span>
							<span>
								{activeRequest.hospitalName.substring(0, 15)}...
							</span>
						</div>
					</div>

					<div className="flex justify-between items-center pt-4 border-t border-red-100 dark:border-red-950 text-xs">
						<span className="text-gray-500 dark:text-zinc-400">
							Requires{" "}
							<strong className="text-gray-900 dark:text-white font-semibold">
								{activeRequest.requiredPints} Pints (
								{activeRequest.bloodType})
							</strong>
						</span>
						<div className="flex gap-2">
							<button
								onClick={() => {
									setActiveTrackingId(null);
									setTrackingProgress(0);
								}}
								className="px-4 py-2 border border-red-200 text-red-700 dark:border-red-900 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl font-medium transition"
							>
								Abort Drive
							</button>
							<button
								onClick={() => setTrackingProgress(100)}
								className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl font-medium transition"
							>
								Simulate Arrival
							</button>
						</div>
					</div>
				</Card>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="space-y-8 lg:col-span-1">
					<Card className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
						<CardHeader className="p-0 pb-4 border-b border-gray-50 dark:border-zinc-800/60 mb-6">
							<CardTitle className="text-base font-bold flex items-center gap-2">
								<Calendar className="h-5 w-5 text-red-600" />
								Donation Deferral Status
							</CardTitle>
							<CardDescription className="text-xs text-gray-500 dark:text-zinc-400">
								{ELIGIBILITY_DAYS}-day standard voluntary
								recovery countdown
							</CardDescription>
						</CardHeader>

						<CardContent className="p-0 flex flex-col items-center">
							<div className="relative w-40 h-40 mb-6">
								<svg className="w-full h-full transform -rotate-90">
									<circle
										cx="80"
										cy="80"
										r="70"
										className="stroke-gray-100 dark:stroke-zinc-800"
										strokeWidth="10"
										fill="transparent"
									/>
									<circle
										cx="80"
										cy="80"
										r="70"
										className="stroke-red-600 dark:stroke-red-500 transition-all duration-1000"
										strokeWidth="10"
										strokeDasharray={439.8}
										strokeDashoffset={
											439.8 -
											(439.8 * deferralPercent) / 100
										}
										strokeLinecap="round"
										fill="transparent"
									/>
								</svg>
								<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
									{!eligibility.eligible ? (
										<>
											<span className="text-4xl font-bold font-mono tracking-tighter text-red-600 dark:text-red-400">
												{eligibility.daysRemaining}
											</span>
											<span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mt-0.5">
												Days Left
											</span>
										</>
									) : (
										<>
											<CheckCircle className="h-10 w-10 text-green-500 animate-pulse mb-1" />
											<span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">
												Eligible Now
											</span>
										</>
									)}
								</div>
							</div>

							<div className="w-full space-y-4">
								<div className="p-3.5 bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 rounded-2xl text-xs space-y-2 text-left">
									<div className="flex justify-between">
										<span className="text-gray-400 font-mono">
											LAST DONATION:
										</span>
										<span className="font-semibold text-gray-800 dark:text-white font-mono">
											{lastDonationDate ?? "N/A"}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-400 font-mono">
											ELIGIBLE DATE:
										</span>
										<span className="font-semibold text-gray-800 dark:text-white font-mono">
											{lastDonationDate
												? (() => {
														const d = new Date(
															lastDonationDate,
														);
														d.setDate(
															d.getDate() +
																ELIGIBILITY_DAYS,
														);
														return d
															.toISOString()
															.split("T")[0];
													})()
												: "Now"}
										</span>
									</div>
								</div>

								<div>
									<label className="block text-[10px] font-mono uppercase text-gray-400 mb-2 tracking-wider text-left">
										Manually Update Last Donation Date:
									</label>
									<input
										type="date"
										value={lastDonationDateInput}
										onChange={(e) =>
											setLastDonationDateInput(
												e.target.value,
											)
										}
										max={
											new Date()
												.toISOString()
												.split("T")[0]
										}
										className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-mono"
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-zinc-900 to-black text-white rounded-3xl p-6 relative overflow-hidden shadow-xl border border-zinc-800">
						<div className="absolute right-0 bottom-0 w-36 h-36 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

						<div className="flex justify-between items-start mb-8">
							<div>
								<span className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[8px] font-mono tracking-widest uppercase text-red-400 border border-white/5">
									BioMatch Insurance Hub
								</span>
								<h3 className="text-sm font-bold tracking-tight text-white/90 mt-2.5">
									Reliance Health HMO
								</h3>
							</div>
							<Shield className="h-6 w-6 text-red-500 fill-current" />
						</div>

						<div className="space-y-4 mb-6 relative">
							<div>
								<span className="text-[10px] text-zinc-400 font-mono block">
									PLAN OWNER
								</span>
								<span className="text-sm font-semibold tracking-tight text-white font-mono uppercase">
									{session.user.name}
								</span>
							</div>
							<div className="flex justify-between">
								<div>
									<span className="text-[10px] text-zinc-400 font-mono block">
										COVERAGE STATUS
									</span>
									<span
										className={`text-xs font-semibold ${completedCountLocal > 0 ? "text-green-400" : "text-yellow-400"}`}
									>
										{hmoTier.name}
									</span>
								</div>
								<div className="text-right">
									<span className="text-[10px] text-zinc-400 font-mono block">
										MEMBER ID
									</span>
									<span className="text-xs font-semibold font-mono text-white/80">
										BM-HMO-
										{(user?.id ?? "0000")
											.substring(0, 6)
											.toUpperCase()}
									</span>
								</div>
							</div>
						</div>

						<div className="pt-4 border-t border-white/10 text-xs">
							<div className="flex justify-between text-[10px] text-zinc-400 mb-2">
								<span>MILESTONE PROGRESS</span>
								<span>{completedCountLocal} / 3 Donations</span>
							</div>

							<div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
								<div
									className="h-full bg-gradient-to-r from-red-600 to-green-400 rounded-full transition-all duration-500"
									style={{
										width: `${Math.min(100, (completedCountLocal / 3) * 100)}%`,
									}}
								/>
							</div>

							<p className="text-[10px] text-zinc-400 mt-3 leading-relaxed">
								{hmoTier.desc}
							</p>
						</div>
					</Card>

					<Card className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
						<CardHeader className="p-0 pb-4 border-b border-gray-50 dark:border-zinc-800/60 mb-6">
							<CardTitle className="text-base font-bold flex items-center gap-2">
								<MapPin className="h-5 w-5 text-red-600" />
								Location and Availability Settings
							</CardTitle>
							<CardDescription className="text-xs text-gray-500 dark:text-zinc-400">
								Update your location and alert settings in real
								time
							</CardDescription>
						</CardHeader>

						<CardContent className="p-0">
							{settingsSuccess && (
								<div className="p-3 mb-4 text-xs text-green-700 bg-green-50 border border-green-200 rounded-2xl">
									{settingsSuccess}
								</div>
							)}

							<form
								onSubmit={handleSaveSettings}
								className="space-y-4"
							>
								<div>
									<label className="block text-[10px] font-mono uppercase text-gray-400 mb-1.5 tracking-wider text-left">
										Availability Status:
									</label>
									<select
										value={donorStatus}
										onChange={(e) =>
											setDonorStatus(
												e.target.value as DonorStatus,
											)
										}
										className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none"
									>
										<option value="available">
											Available -- Receives alerts
										</option>
										<option value="busy">
											Busy -- Temporarily muted
										</option>
										<option value="inactive">
											Inactive -- Do not alert
										</option>
									</select>
								</div>

								<div>
									<label className="block text-[10px] font-mono uppercase text-gray-400 mb-1.5 tracking-wider text-left">
										Current Location (Lagos Area):
									</label>
									<select
										value={donorLocation}
										onChange={(e) =>
											setDonorLocation(e.target.value)
										}
										className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none"
									>
										<option value="Ikeja, Lagos">
											Ikeja, Lagos
										</option>
										<option value="Yaba, Lagos">
											Yaba, Lagos
										</option>
										<option value="Lekki, Lagos">
											Lekki, Lagos
										</option>
										<option value="Surulere, Lagos">
											Surulere, Lagos
										</option>
										<option value="Victoria Island, Lagos">
											Victoria Island, Lagos
										</option>
										<option value="Idi-Araba, Lagos">
											Idi-Araba, Lagos
										</option>
									</select>
								</div>

								<div>
									<div className="flex justify-between items-center text-[10px] font-mono uppercase text-gray-400 mb-1 tracking-wider">
										<span>Alert Radius Limit:</span>
										<span className="text-red-600 font-bold">
											{maxRadius} km
										</span>
									</div>
									<input
										type="range"
										min="5"
										max="50"
										step="5"
										value={maxRadius}
										onChange={(e) =>
											setMaxRadius(Number(e.target.value))
										}
										className="w-full h-1 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600"
									/>
									<div className="flex justify-between text-[8px] text-gray-400 font-mono mt-1">
										<span>5 KM</span>
										<span>50 KM</span>
									</div>
								</div>

								<div className="pt-2 flex items-center justify-between border-t border-gray-50 dark:border-zinc-800/50">
									<div className="text-left">
										<span className="text-[10px] font-mono uppercase text-gray-400 block tracking-wider">
											SMS Fallback Alert
										</span>
										<span className="text-[9px] text-gray-400">
											Receive SMS if push unopened in 2m
										</span>
									</div>
									<input
										type="checkbox"
										checked={smsFallbackEnabled}
										onChange={(e) =>
											setSmsFallbackEnabled(
												e.target.checked,
											)
										}
										className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 accent-red-600"
									/>
								</div>

								<button
									type="submit"
									className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition shadow active:scale-95"
								>
									Save Profile Settings
								</button>
							</form>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-8 lg:col-span-2">
					<div className="space-y-6">
						<div className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
							<div>
								<h3 className="font-bold flex items-center gap-2 text-red-600">
									<Bell className="h-5 w-5" />
									Urgent Emergency Match Feed
								</h3>
								<p className="text-xs text-gray-400 mt-1">
									Matching compatible Blood Type:{" "}
									<strong className="text-red-600 font-mono">
										{bloodType}
									</strong>
								</p>
							</div>
							<span className="text-[10px] uppercase font-mono px-2.5 py-1 bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 rounded-full border border-green-200">
								LIVE
							</span>
						</div>

						<div className="space-y-4">
							{requests.length === 0 ? (
								<div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-10 text-center text-gray-500">
									No active emergency alerts currently
									matching your criteria. Thank you for your
									availability!
								</div>
							) : (
								requests.map((req) => {
									const isApproved =
										donorApprovedRequests.includes(
											req.id,
										) || req.status === "matched";
									const isTrackingThis =
										activeTrackingId === req.id;

									return (
										<div
											key={req.id}
											className={`bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6 transition-all duration-300 relative overflow-hidden ${isApproved ? "border-green-300 dark:border-green-900/50" : ""}`}
										>
											<div className="absolute right-6 top-6 w-11 h-11 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 font-bold font-mono">
												{req.bloodType}
											</div>

											<div className="flex items-start gap-3 border-b border-gray-100 dark:border-zinc-800/80 pb-4 mb-4">
												<Activity className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
												<div>
													<div className="flex items-center gap-2 flex-wrap">
														<span className="font-bold text-base md:text-lg">
															{req.hospitalName}
														</span>
														{req.urgency ===
														"critical" ? (
															<Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 font-mono text-[10px] tracking-wider animate-pulse">
																CRITICAL
															</Badge>
														) : (
															<Badge className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 font-mono text-[10px] tracking-wider">
																HIGH
															</Badge>
														)}
													</div>

													<div className="flex items-center gap-4 text-xs text-gray-400 mt-1 font-medium">
														<span className="flex items-center gap-1">
															<MapPin className="h-3.5 w-3.5" />
															{req.location}
														</span>
														<span className="flex items-center gap-1">
															<Clock className="h-3.5 w-3.5" />
															{new Date(
																req.timestamp,
															).toLocaleTimeString(
																[],
																{
																	hour: "2-digit",
																	minute: "2-digit",
																},
															)}
														</span>
													</div>
												</div>
											</div>

											<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-zinc-800/60 pb-3.5 mb-3.5">
												<div className="text-xs text-gray-500 dark:text-zinc-400 space-y-1 text-left">
													<div>
														Required:{" "}
														<strong className="text-gray-900 dark:text-white font-semibold">
															{req.requiredPints}{" "}
															Pints
														</strong>{" "}
														- Emergency Hotline:{" "}
														<span className="font-mono text-red-600 dark:text-red-400">
															{req.contactPhone}
														</span>
													</div>
													<div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 flex-wrap">
														<span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
															<span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
															Push Notification:
															DELIVERED
														</span>
														<span>-</span>
														{req.urgency ===
														"critical" ? (
															<span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
																<span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
																SMS Fallback:
																SENT
																SIMULTANEOUSLY
															</span>
														) : (
															<span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-semibold">
																<span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
																SMS Fallback:
																QUEUED FOR 2-MIN
																TIMEOUT
															</span>
														)}
													</div>
												</div>
											</div>

											<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
												<div className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
													Status:{" "}
													<span className="text-red-600 dark:text-red-400 font-bold uppercase">
														{isApproved
															? "Matched and Underway"
															: "Pending Response"}
													</span>
												</div>

												{isApproved ? (
													isTrackingThis ? (
														<button
															disabled
															className="px-5 py-2 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 rounded-2xl text-xs font-semibold flex items-center gap-1.5"
														>
															<Clock className="h-4 w-4 animate-spin" />
															Transit Tracker
															Active
														</button>
													) : (
														<button
															disabled
															className="px-5 py-2 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/40 rounded-2xl text-xs font-semibold flex items-center gap-1.5"
														>
															<Check className="h-4 w-4" />
															Matched
														</button>
													)
												) : (
													<div className="flex gap-2 w-full sm:w-auto">
														<button className="px-4 py-2 border border-gray-200 dark:border-zinc-800 text-gray-500 hover:text-red-600 rounded-2xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 transition w-1/2 sm:w-auto">
															Decline
														</button>
														<button
															onClick={() =>
																handleRespond(
																	req.id,
																)
															}
															disabled={
																!eligibility.eligible ||
																donorStatus !==
																	"available"
															}
															className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-semibold transition w-1/2 sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed"
															title={
																!eligibility.eligible
																	? "You must wait until deferral period is complete"
																	: "Toggle Availability to Available"
															}
														>
															Accept and Depart
														</button>
													</div>
												)}
											</div>
										</div>
									);
								})
							)}
						</div>
					</div>

					<Card className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
						<CardHeader className="p-0 pb-4 border-b border-gray-50 dark:border-zinc-800/60 mb-6">
							<CardTitle className="text-base font-bold flex items-center gap-2">
								<Activity className="h-5 w-5 text-red-600" />
								Lagos Blood Supply and Demand Trends
							</CardTitle>
							<CardDescription className="text-xs text-gray-500 dark:text-zinc-400">
								Monthly active emergency requests count by blood
								group in your area
							</CardDescription>
						</CardHeader>

						<CardContent className="p-0">
							<div className="space-y-4 pt-2">
								{(() => {
									const groups = [
										"A_PLUS",
										"A_MINUS",
										"B_PLUS",
										"B_MINUS",
										"AB_PLUS",
										"AB_MINUS",
										"O_PLUS",
										"O_MINUS",
									];
									const totals: Record<string, number> = {};
									for (const g of groups) {
										totals[g] = 0;
									}
									for (const bank of banks ?? []) {
										const inv = bank.inventory as Record<
											string,
											number
										>;
										for (const g of groups) {
											totals[g] += inv?.[g] ?? 0;
										}
									}
									const maxTotal = Math.max(
										...Object.values(totals),
										1,
									);
									const displayData = [
										{
											blood: "O+",
											key: "O_PLUS",
											units: totals["O_PLUS"] ?? 0,
											status: "Supply Level",
										},
										{
											blood: "O-",
											key: "O_MINUS",
											units: totals["O_MINUS"] ?? 0,
											status: "Supply Level",
										},
										{
											blood: "B-",
											key: "B_MINUS",
											units: totals["B_MINUS"] ?? 0,
											status: "Supply Level",
										},
										{
											blood: "A+",
											key: "A_PLUS",
											units: totals["A_PLUS"] ?? 0,
											status: "Supply Level",
										},
										{
											blood: "AB-",
											key: "AB_MINUS",
											units: totals["AB_MINUS"] ?? 0,
											status: "Supply Level",
										},
									];
									return displayData.map((item) => {
										const pct = Math.round(
											(item.units / maxTotal) * 100,
										);
										const isLow = item.units < 5;
										const isMedium =
											item.units >= 5 && item.units < 15;
										const barColor = isLow
											? "bg-red-600"
											: isMedium
												? "bg-orange-500"
												: "bg-red-600";
										const statusLabel = isLow
											? "Critical Shortage"
											: isMedium
												? "High Demand"
												: "Stable";
										const isUsers =
											displayBloodGroup(item.key) ===
											bloodType;
										return (
											<div
												key={item.key}
												className="space-y-1 text-left"
											>
												<div className="flex justify-between items-center text-xs">
													<div className="flex items-center gap-2">
														<span
															className={`w-8 font-bold font-mono ${isUsers ? "text-red-600" : "text-gray-900 dark:text-white"}`}
														>
															{item.blood}
														</span>
														<span className="text-[10px] px-2 py-0.5 rounded bg-gray-50 dark:bg-zinc-950 font-mono text-gray-400">
															{statusLabel}
														</span>
													</div>
													<span className="font-mono text-gray-500">
														{item.units} units
													</span>
												</div>

												<div className="w-full h-2.5 bg-gray-50 dark:bg-zinc-950 rounded-full border border-gray-100 dark:border-zinc-850 overflow-hidden">
													<div
														className={`h-full ${barColor} rounded-full transition-all duration-1000`}
														style={{
															width: `${Math.max(2, pct)}%`,
														}}
													/>
												</div>
											</div>
										);
									});
								})()}
							</div>
						</CardContent>
					</Card>

					<Card className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
						<CardHeader className="p-0 pb-4 border-b border-gray-50 dark:border-zinc-800/60 mb-6">
							<CardTitle className="text-base font-bold flex items-center gap-2">
								<Award className="h-5 w-5 text-red-600" />
								Personal Donation History
							</CardTitle>
							<CardDescription className="text-xs text-gray-500 dark:text-zinc-400">
								Complete record of your verified life-saving
								contributions
							</CardDescription>
						</CardHeader>

						<CardContent className="p-0">
							{donationRecords.length === 0 ? (
								<div className="text-sm text-gray-400 p-6 text-center">
									You haven&apos;t logged any donations yet.
									Go on your first active mission to start
									tracking your impact!
								</div>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full text-xs text-left">
										<thead>
											<tr className="border-b border-gray-100 dark:border-zinc-800 text-gray-400 font-mono uppercase">
												<th className="py-3 px-2">
													Date
												</th>
												<th className="py-3 px-2">
													Hospital
												</th>
												<th className="py-3 px-2">
													Group
												</th>
												<th className="py-3 px-2 text-right">
													Status
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-50 dark:divide-zinc-800/60">
											{donationRecords.map((rec) => (
												<tr
													key={rec.id}
													className="hover:bg-gray-50/50 dark:hover:bg-zinc-850/20"
												>
													<td className="py-3.5 px-2 font-mono text-gray-500">
														{rec.date}
													</td>
													<td className="py-3.5 px-2 font-semibold text-gray-900 dark:text-white">
														{rec.hospitalName}
													</td>
													<td className="py-3.5 px-2 font-mono">
														{rec.bloodType}
													</td>
													<td className="py-3.5 px-2 text-right">
														<span className="px-2 py-0.5 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 rounded-md font-mono text-[9px] uppercase font-bold border border-green-100 dark:border-green-900/40">
															{rec.status}
														</span>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{isSuccessModalOpen && (
				<div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
					<Card className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl relative text-center">
						<div className="w-16 h-16 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
							<CheckCircle className="h-10 w-10" />
						</div>

						<h3 className="text-2xl font-bold tracking-tight">
							Mission Fulfilled!
						</h3>
						<p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 leading-relaxed">
							You have successfully arrived at the hospital
							checkpoint. The medical staff has processed your
							donation, and your profile is now updated!
						</p>

						<div className="my-6 p-4 bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 rounded-2xl text-left text-xs space-y-1.5">
							<div className="flex justify-between">
								<span className="text-gray-400">
									HMO Milestone Count:
								</span>
								<span className="font-bold text-gray-800 dark:text-white">
									{completedCountLocal} --{" "}
									{completedCountLocal + 1}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-400">
									Insurance Status:
								</span>
								<span className="font-bold text-green-600">
									{completedCountLocal + 1 >= 3
										? "Premium Tier Gold"
										: "Basic Tier Active"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-400">
									Eligibility Deferral:
								</span>
								<span className="font-bold text-red-500">
									56 days recovery reset
								</span>
							</div>
						</div>

						<button
							onClick={handleManualComplete}
							className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-semibold text-sm transition"
						>
							Update My Records
						</button>
					</Card>
				</div>
			)}
		</div>
	);
}
