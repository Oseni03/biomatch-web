"use client";

import { useState, useEffect } from "react";
import { Bell, Users, BarChart, UserPlus, Clock } from "lucide-react";
import type { EmergencyMatchRequest } from "@/lib/donor-types";
import { RadiusExpansionCard } from "@/components/hospital/radius-expansion-card";
import { EmergencyRequestForm } from "@/components/hospital/emergency-request-form";
import {
	BroadcastStreamCard,
	type FunnelData,
} from "@/components/hospital/broadcast-stream-card";
import { DonorDirectory } from "@/components/hospital/donor-directory";
import { AnalyticsDashboard } from "@/components/hospital/analytics-dashboard";
import { StaffAccounts } from "@/components/hospital/staff-accounts";

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
	{ id: "staff" as const, label: "Hospital Staff Accounts", icon: UserPlus },
];

export default function HospitalDashboard({
	session,
	requests,
	onAddNewRequest,
	onConfirmFulfillment,
}: HospitalDashboardProps) {
	const userDetails = session.details as HospitalProfile;

	const [activeTab, setActiveTab] = useState<
		"broadcasts" | "directory" | "analytics" | "staff"
	>("broadcasts");
	const [alertRadius, setAlertRadius] = useState(3);
	const [autoExpandCountdown, setAutoExpandCountdown] = useState(30);
	const [isExpandingRadius, setIsExpandingRadius] = useState(false);
	const [funnelStates, setFunnelStates] = useState<
		Record<string, FunnelData>
	>({});

	const hospitalRequests = requests.filter(
		(r) => r.hospitalName === session.name,
	);

	useEffect(() => {
		let timer: NodeJS.Timeout;
		const hasPending = hospitalRequests.some((r) => r.status === "pending");

		if (hasPending) {
			timer = setInterval(() => {
				setAutoExpandCountdown((prev) => {
					if (prev <= 1) {
						setAlertRadius((r) => Math.min(15, r + 3));
						setIsExpandingRadius(true);
						setTimeout(() => setIsExpandingRadius(false), 2000);
						return 30;
					}
					return prev - 1;
				});
			}, 1000);
		} else {
			setAutoExpandCountdown(30);
		}

		return () => clearInterval(timer);
	}, [hospitalRequests]);

	useEffect(() => {
		const updated: Record<string, FunnelData> = { ...funnelStates };
		let changed = false;

		hospitalRequests.forEach((req) => {
			if (!updated[req.id]) {
				changed = true;
				const isCritical = req.urgency === "critical";
				const alerted = isCritical ? 34 : 18;
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
	}, [requests]);

	const handleWidenRadius = () => {
		setAlertRadius((r) => Math.min(15, r + 2));
		setIsExpandingRadius(true);
		setTimeout(() => setIsExpandingRadius(false), 2000);
		setAutoExpandCountdown(30);
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

	return (
		<div className="space-y-8 text-left">
			<div className="flex border-b border-gray-200 dark:border-zinc-800 pb-px gap-6 overflow-x-auto">
				{TABS.map((tab) => {
					const Icon = tab.icon;
					return (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex items-center gap-2 pb-4 text-sm font-medium border-b-2 transition cursor-pointer whitespace-nowrap ${
								activeTab === tab.id
									? "border-red-600 text-red-600 dark:border-red-500 dark:text-red-500 font-bold"
									: "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
							}`}
						>
							<Icon className="h-4.5 w-4.5" />
							{tab.label}
						</button>
					);
				})}
			</div>

			{activeTab === "broadcasts" && (
				<div className="space-y-8 animate-in fade-in duration-300">
					{hospitalRequests.some((r) => r.status === "pending") && (
						<RadiusExpansionCard
							hospitalLocation={userDetails?.location || "Lagos"}
							alertRadius={alertRadius}
							autoExpandCountdown={autoExpandCountdown}
							isExpanding={isExpandingRadius}
							onWidenRadius={handleWidenRadius}
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
						<h3 className="font-bold flex items-center gap-2 text-base text-gray-900 dark:text-white">
							<Clock className="h-5 w-5 text-gray-400" />
							Active Dispatch Stream
						</h3>

						{hospitalRequests.length === 0 ? (
							<div className="bg-white dark:bg-zinc-900 border rounded-3xl p-10 text-center text-gray-500">
								You haven't launched any emergency requests yet.
								Click "Launch Emergency Match Request" above to
								trigger a live matching query.
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
				</div>
			)}

			{activeTab === "directory" && <DonorDirectory />}

			{activeTab === "analytics" && <AnalyticsDashboard />}

			{activeTab === "staff" && <StaffAccounts />}
		</div>
	);
}
