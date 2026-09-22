import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Search } from "lucide-react";
import { getServerSession } from "@/lib/get-session";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { StatusTag } from "@/components/brand/status-tag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	getVerificationQueue,
	listHospitals,
	type HospitalStatus,
} from "@/servers/admin";

const STATUS_FILTERS: { value: string; label: string }[] = [
	{ value: "", label: "All" },
	{ value: "pending", label: "Pending" },
	{ value: "approved", label: "Approved" },
	{ value: "rejected", label: "Rejected" },
	{ value: "suspended", label: "Suspended" },
];

function statusTone(status: string): "info" | "ok" | "low" | "critical" {
	switch (status) {
		case "pending":
			return "info";
		case "approved":
			return "ok";
		case "rejected":
			return "critical";
		case "suspended":
			return "low";
		default:
			return "info";
	}
}

function queryString(params: { status?: string; search?: string; page?: number }) {
	const search = new URLSearchParams();
	if (params.status) search.set("status", params.status);
	if (params.search) search.set("search", params.search);
	if (params.page && params.page > 1) search.set("page", String(params.page));
	const text = search.toString();
	return text ? `?${text}` : "";
}

export default async function AdminHospitalsPage({
	searchParams,
}: {
	searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}
	const params = await searchParams;
	const status = (params.status || "") as HospitalStatus | "";
	const search = params.search ?? "";
	const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

	const [queue, result] = await Promise.all([
		getVerificationQueue(session.user.id),
		listHospitals(session.user.id, {
			status: status || undefined,
			search: search || undefined,
			page,
			pageSize: 20,
		}),
	]);

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Hospital management"
				subtitle="Review applications, approve or reject hospitals, and manage verified partners."
			/>

			<section className="rounded-2xl border border-border bg-card p-6">
				<h2 className="text-base font-bold text-foreground">Review queue</h2>
				{queue.length === 0 ? (
					<div className="mt-3 rounded-xl border border-dashed border-border bg-muted/50 px-6 py-8 text-center">
						<Building2 className="mx-auto h-7 w-7 text-muted-foreground" />
						<p className="mt-2 text-sm font-semibold text-foreground">
							Review queue is clear
						</p>
						<p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
							No hospital applications are waiting for review. New registrations
							appear here automatically.
						</p>
					</div>
				) : (
					<ul className="mt-4 divide-y divide-border">
						{queue.map((item) => (
							<li key={item.id} className="flex flex-wrap items-center gap-3 py-3">
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-semibold text-foreground">
										{item.organization.name}
									</p>
									<p className="truncate text-xs text-muted-foreground">
										{item.organization.officialEmail} · {item.organization.state}
										{item.organization.lga ? ` · ${item.organization.lga}` : ""} ·
										submitted {item.submittedAt.toLocaleDateString()}
									</p>
								</div>
								<Button asChild size="sm" className="rounded-xl">
									<Link href={`/admin/hospitals/${item.organization.id}`}>Review</Link>
								</Button>
							</li>
						))}
					</ul>
				)}
			</section>

			<section className="rounded-2xl border border-border bg-card p-6">
				<h2 className="text-base font-bold text-foreground">All hospitals</h2>
				<form method="get" className="mt-4 flex flex-col gap-3 sm:flex-row">
					<div className="relative flex-1">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							name="search"
							defaultValue={search}
							placeholder="Search name, email or registration number"
							className="rounded-xl pl-9"
						/>
					</div>
					<div className="flex gap-2">
						{STATUS_FILTERS.map((filter) => (
							<Link
								key={filter.value}
								href={`/admin/hospitals${queryString({ status: filter.value, search })}`}
								className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
									status === filter.value
										? "border-brand bg-brand text-white"
										: "border-border bg-background text-muted-foreground hover:text-foreground"
								}`}
							>
								{filter.label}
							</Link>
						))}
					</div>
					<Button type="submit" variant="outline" className="rounded-xl">
						Search
					</Button>
				</form>

				{result.hospitals.length === 0 ? (
					<div className="mt-4 rounded-xl border border-dashed border-border bg-muted/50 px-6 py-8 text-center">
						<Building2 className="mx-auto h-7 w-7 text-muted-foreground" />
						<p className="mt-2 text-sm font-semibold text-foreground">
							No hospitals found
						</p>
						<p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
							{search || status
								? "Try a different search term or status filter."
								: "No hospitals have registered yet."}
						</p>
					</div>
				) : (
					<ul className="mt-4 divide-y divide-border">
						{result.hospitals.map((hospital) => (
							<li key={hospital.id}>
								<Link
									href={`/admin/hospitals/${hospital.id}`}
									className="flex flex-wrap items-center gap-3 py-3"
								>
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-semibold text-foreground">
											{hospital.name}
										</p>
										<p className="truncate text-xs text-muted-foreground">
											{hospital.officialEmail} · {hospital.state} ·{" "}
											{hospital.memberCount}{" "}
											{hospital.memberCount === 1 ? "member" : "members"}
										</p>
									</div>
									<StatusTag status={statusTone(hospital.verificationStatus)}>
										{hospital.verificationStatus}
									</StatusTag>
								</Link>
							</li>
						))}
					</ul>
				)}

				{result.totalPages > 1 && (
					<div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
						<span>
							Page {result.page} of {result.totalPages} · {result.total} hospitals
						</span>
						<div className="flex gap-2">
							{result.page > 1 && (
								<Button asChild size="sm" variant="outline" className="rounded-xl">
									<Link
										href={`/admin/hospitals${queryString({ status, search, page: result.page - 1 })}`}
									>
										Previous
									</Link>
								</Button>
							)}
							{result.page < result.totalPages && (
								<Button asChild size="sm" variant="outline" className="rounded-xl">
									<Link
										href={`/admin/hospitals${queryString({ status, search, page: result.page + 1 })}`}
									>
										Next
									</Link>
								</Button>
							)}
						</div>
					</div>
				)}
			</section>
		</div>
	);
}
