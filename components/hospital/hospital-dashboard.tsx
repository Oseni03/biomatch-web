"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
	Bell,
	Users,
	BarChart,
	UserPlus,
	Clock,
	History,
	Activity,
	CheckCircle2,
	AlertTriangle,
} from "lucide-react";
import type { EmergencyMatchRequest } from "@/lib/donor-types";
import { EXPANSION_TIMEOUT_MS } from "@/lib/radius-expansion";
import { RadiusExpansionCard } from "@/components/hospital/radius-expansion-card";
import { EmergencyRequestForm } from "@/components/hospital/emergency-request-form";
import {
	BroadcastStreamCard,
	type FunnelData,
} from "@/components/hospital/broadcast-stream-card";
import { LiveStatusPanel } from "@/components/hospital/live-status-panel";
import { EmergencyHistory } from "@/components/hospital/emergency-history";
import { DonorDirectory } from "@/components/hospital/donor-directory";
import { AnalyticsDashboard } from "@/components/hospital/analytics-dashboard";
import { StaffAccounts } from "@/components/hospital/staff-accounts";
import {
	usePendingEmergencyRequests,
	useExpandSearchRadius,
} from "@/hooks/use-emergency-requests";
import { StatCard } from "@/components/dashboard/stat-card";

interface HospitalProfile {
	location: string;
	phone: string;
}

interface UserSession {
	name: string;
	details: HospitalProfile;
}

interface HospitalDashboardProps {
	session: UserSession;
	hospitalUserId?: string;
	requests: EmergencyMatchRequest[];
	onAddNewRequest: (newReq: EmergencyMatchRequest) => void;
	onConfirmFulfillment: (reqId: string) => void;
}

const TABS = [
	{ id: "broadcasts" as const, label: "Active Match Broadcasts", icon: Bell },
	{
		id: "directory" as const,
		label: "Proactive Donor Directory",
		icon: Users,
	},
	{ id: "analytics" as const, label: "Analytics & Reports", icon: BarChart },
	{ id: "history" as const, label: "Request History", icon: History },
	{ id: "staff" as const, label: "Hospital Staff Accounts", icon: UserPlus },
];

const EXPANSION_COUNTDOWN_S = Math.floor(EXPANSION_TIMEOUT_MS / 1000);

export default function HospitalDashboard({
	session,
	hospitalUserId,
	requests,
	onAddNewRequest,
	onConfirmFulfillment,
}: HospitalDashboardProps) {
	const userDetails = session.details as HospitalProfile;

	const [activeTab, setActiveTab] = useState<
		"broadcasts" | "directory" | "analytics" | "history" | "staff"
	>("broadcasts");

	const { data: pendingRequests } = usePendingEmergencyRequests(hospitalUserId);
	const expandMutation = useExpandSearchRadius();

	const pendingServerReqs = pendingRequests ?? [];
	const hasPendingServerReq = pendingServerReqs.some(
		(r) => r.status === "pending",
	);

	const [alertRadius, setAlertRadius] = useState(5);
	const [totalDonors, setTotalDonors] = useState(0);
	const [autoExpandCountdown, setAutoExpandCountdown] =
		useState(EXPANSION_COUNTDOWN_S);
	const [isExpandingRadius, setIsExpandingRadius] = useState(false);
	const [expandingRequestId, setExpandingRequestId] = useState<string | null>(
		null,
	);
	const [funnelStates, setFunnelStates] = useState<
		Record<string, FunnelData>
	>({});

	const lastExpandRef = useRef<number>(0);

	useEffect(() => {
		if (pendingServerReqs.length > 0) {
			const pending = pendingServerReqs.find((r) => r.status === "pending");
			if (pending) {
				setAlertRadius(pending.searchRadius);
				setTotalDonors(pending.alerts.length);
				setExpandingRequestId(pending.id);
			}
		}
	}, [pendingServerReqs]);

	useEffect(() => {
		if (!hasPendingServerReq || !expandingRequestId) {
			setAutoExpandCountdown(EXPANSION_COUNTDOWN_S);
			return;
		}

		const timer = setInterval(() => {
			setAutoExpandCountdown((prev) => {
				if (prev <= 1) {
					const now = Date.now();
					if (now - lastExpandRef.current > 10_000) {
						lastExpandRef.current = now;
						expandMutation.mutate(
							{ requestId: expandingRequestId },
							{
								onSuccess: (data) => {
									if (data.expanded) {
										setAlertRadius(data.searchRadius);
										setTotalDonors(data.totalDonors);
										setIsExpandingRadius(true);
										setTimeout(
											() => setIsExpandingRadius(false),
											2000,
										);
									}
								},
							},
						);
					}
					return EXPANSION_COUNTDOWN_S;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [hasPendingServerReq, expandingRequestId]);

	useEffect(() => {
		if (!hasPendingServerReq && expandingRequestId) {
			setExpandingRequestId(null);
		}
	}, [hasPendingServerReq, expandingRequestId]);

	const hospitalRequests = requests.filter(
		(r) => r.hospitalName === session.name,
	);

	useEffect(() => {
		const updated: Record<string, FunnelData> = { ...funnelStates };
		let changed = false;

		hospitalRequests.forEach((req) => {
			if (!updated[req.id]) {
				changed = true;
				const isCritical = req.urgency === "critical";
				const serverReq = pendingServerReqs.find(
					(sr) => sr.id === req.id,
				);
				const alerted = serverReq?.alerts.length ?? (isCritical ? 34 : 18);
				const opened = Math.round(alerted * 0.7);
				const accepted = req.status === "matched" ? 1 : 0;

				updated[req.id] = {
					alerted,
					opened,
					accepted,
					progress: req.status === "matched" ? 45 : 0,
					donorName: req.status === "matched" ? "Chinedu Okafor" : "",
					donorPhone: req.status === "matched" ? "08034567891" : "",
					eta: req.status === "matched" ? 8 : 0,
				};
			}
		});

		if (changed) {
			setFunnelStates(updated);
		}
	}, [requests, pendingServerReqs]);

	const handleWidenRadius = () => {
		if (!expandingRequestId) return;
		const now = Date.now();
		if (now - lastExpandRef.current < 5_000) return;
		lastExpandRef.current = now;
		expandMutation.mutate(
			{ requestId: expandingRequestId },
			{
				onSuccess: (data) => {
					if (data.expanded) {
						setAlertRadius(data.searchRadius);
						setTotalDonors(data.totalDonors);
						setIsExpandingRadius(true);
						setTimeout(() => setIsExpandingRadius(false), 2000);
						setAutoExpandCountdown(EXPANSION_COUNTDOWN_S);
					}
				},
			},
		);
	};

	const handleCreateRequest = (newReq: EmergencyMatchRequest) => {
		onAddNewRequest(newReq);

		setTimeout(() => {
			setFunnelStates((prev) => {
				const copy = { ...prev };
				if (copy[newReq.id]) {
					copy[newReq.id] = {
						...copy[newReq.id],
						accepted: 1,
						donorName: "Emeka Obi",
						donorPhone: "08123456789",
						progress: 10,
						eta: 14,
					};
				}
				return copy;
			});

			const rawStored = localStorage.getItem("biomatch_broadcasts");
			if (rawStored) {
				const list: EmergencyMatchRequest[] = JSON.parse(rawStored);
				const idx = list.findIndex((r) => r.id === newReq.id);
				if (idx !== -1) {
					list[idx].status = "matched";
					localStorage.setItem(
						"biomatch_broadcasts",
						JSON.stringify(list),
					);
				}
			}
		}, 6000);
	};

	const handleFulfillDonation = (reqId: string) => {
		onConfirmFulfillment(reqId);
		setFunnelStates((prev) => {
			const copy = { ...prev };
			if (copy[reqId]) {
				copy[reqId].progress = 100;
				copy[reqId].eta = 0;
			}
			return copy;
		});
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.08 },
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 16 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
	};

	const totalAlerts = requests.length;
	const activeAlerts = requests.filter(
		(r) => r.status === "pending" || r.status === "matched",
	).length;
	const fulfilledAlerts = requests.filter(
		(r) => r.status === "completed",
	).length;

	return (
		<motion.div
			className="space-y-8 text-left"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
		>
			<motion.div
				variants={itemVariants}
				className="grid grid-cols-2 lg:grid-cols-4 gap-4"
			>
				<StatCard
					icon={Activity}
					label="Total Requests"
					value={String(totalAlerts)}
				/>
				<StatCard
					icon={AlertTriangle}
					label="Active Alerts"
					value={String(activeAlerts)}
					tone={activeAlerts > 0 ? "warning" : "default"}
				/>
				<StatCard
					icon={Users}
					label="Donors Responding"
					value={String(
						pendingServerReqs.reduce(
							(sum, r) => sum + r.alerts.length,
							0,
						),
					)}
				/>
				<StatCard
					icon={CheckCircle2}
					label="Fulfilled"
					value={String(fulfilledAlerts)}
				/>
			</motion.div>

			<div className="flex border-b border-border pb-px gap-6 overflow-x-auto">
				{TABS.map((tab) => {
					const Icon = tab.icon;
					return (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex items-center gap-2 pb-4 text-sm font-medium border-b-2 transition cursor-pointer whitespace-nowrap ${
								activeTab === tab.id
									? "border-brand text-brand font-bold"
									: "border-transparent text-muted-foreground hover:text-foreground"
							}`}
						>
							<Icon className="h-4.5 w-4.5" />
							{tab.label}
						</button>
					);
				})}
			</div>

			{activeTab === "broadcasts" && (
				<motion.div variants={itemVariants} className="space-y-8">
					{hasPendingServerReq && expandingRequestId && (
						<RadiusExpansionCard
							hospitalLocation={userDetails?.location || "Lagos"}
							alertRadius={alertRadius}
							autoExpandCountdown={autoExpandCountdown}
							isExpanding={isExpandingRadius}
							totalDonors={totalDonors}
							onWidenRadius={handleWidenRadius}
							requestId={expandingRequestId}
						/>
					)}

					<EmergencyRequestForm
						hospitalName={session.name}
						hospitalLocation={
							userDetails?.location || "Ikeja, Lagos"
						}
						hospitalPhone={userDetails?.phone || "08098765432"}
						onSubmit={handleCreateRequest}
					/>

					<div className="space-y-6">
						<h3 className="font-bold flex items-center gap-2 text-base text-foreground">
							<Clock className="h-5 w-5 text-muted-foreground" />
							Active Dispatch Stream
						</h3>

						{pendingServerReqs.length > 0 && (
							<div className="space-y-4">
								<h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
									Live Status Panel
								</h4>
								{pendingServerReqs.map((req) => (
									<LiveStatusPanel
										key={req.id}
										requestId={req.id}
									/>
								))}
							</div>
						)}

						{hospitalRequests.length === 0 ? (
							<div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground">
								You haven't launched any emergency requests
								yet. Click "Launch Emergency Match Request"
								above to trigger a live matching query.
							</div>
						) : (
							hospitalRequests.map((req) => {
								const funnel = funnelStates[req.id] || {
									alerted: 24,
									opened: 12,
									accepted: 0,
									progress: 0,
									donorName: "",
									donorPhone: "",
									eta: 0,
								};
								return (
									<BroadcastStreamCard
										key={req.id}
										request={req}
										funnel={funnel}
										onConfirmFulfillment={
											handleFulfillDonation
										}
									/>
								);
							})
						)}
					</div>
				</motion.div>
			)}

			{activeTab === "history" && hospitalUserId && (
				<motion.div variants={itemVariants}>
					<EmergencyHistory hospitalId={hospitalUserId} />
				</motion.div>
			)}

			{activeTab === "directory" && (
				<motion.div variants={itemVariants}>
					<DonorDirectory />
				</motion.div>
			)}

			{activeTab === "analytics" && (
				<motion.div variants={itemVariants}>
					<AnalyticsDashboard />
				</motion.div>
			)}

			{activeTab === "staff" && (
				<motion.div variants={itemVariants}>
					<StaffAccounts />
				</motion.div>
			)}
		</motion.div>
	);
}
