"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import type { EmergencyMatchRequest } from "@/lib/donor-types";
import HospitalDashboard from "@/components/hospital/hospital-dashboard";

const STORAGE_KEY = "biomatch_broadcasts";

function loadRequests(): EmergencyMatchRequest[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

export default function HospitalDashboardPage() {
	const { data: session, isPending: sessionLoading } =
		authClient.useSession();

	const [requests, setRequests] = useState<EmergencyMatchRequest[]>([]);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		setRequests(loadRequests());
		setLoaded(true);
	}, []);

	useEffect(() => {
		if (loaded) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
		}
	}, [requests, loaded]);

	const handleAddNewRequest = (newReq: EmergencyMatchRequest) => {
		setRequests((prev) => [newReq, ...prev]);
	};

	const handleConfirmFulfillment = (reqId: string) => {
		setRequests((prev) =>
			prev.map((r) =>
				r.id === reqId ? { ...r, status: "completed" as const } : r,
			),
		);
	};

	if (sessionLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!session?.user) {
		return (
			<p className="text-sm text-muted-foreground">
				Sign in to view the hospital dashboard
			</p>
		);
	}

	const dashboardSession = {
		name: session.user.name ?? "Hospital",
		details: {
			location: "Ikeja, Lagos",
			phone: "08098765432",
		},
	};

	return (
		<HospitalDashboard
			session={dashboardSession}
			hospitalUserId={session.user.id}
			requests={requests}
			onAddNewRequest={handleAddNewRequest}
			onConfirmFulfillment={handleConfirmFulfillment}
		/>
	);
}
