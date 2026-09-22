import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { getFailedDeliveries } from "@/servers/delivery";
import { StatusTag } from "@/components/brand/status-tag";

export async function DeliveryFailuresCard() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}
	const { deliveries, total } = await getFailedDeliveries(session.user.id, {
		page: 1,
		pageSize: 10,
	}).catch(() => ({ deliveries: [], total: 0 }));

	return (
		<section className="rounded-2xl border border-border bg-card p-6">
			<h2 className="text-base font-bold text-foreground">Delivery failures</h2>
			<p className="mt-1 text-xs text-muted-foreground">
				{total === 0
					? "No failed external deliveries. Failures appear here with the provider error for debugging."
					: `${total} failed external ${total === 1 ? "delivery" : "deliveries"} — latest first. The retry job re-attempts each up to its cap.`}
			</p>
			{deliveries.length > 0 && (
				<ul className="mt-3 divide-y divide-border">
					{deliveries.map((delivery) => (
						<li key={delivery.deliveryId} className="flex flex-wrap items-center gap-3 py-3">
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-semibold text-foreground">
									{delivery.title}
								</p>
								<p className="truncate text-xs text-muted-foreground">
									{delivery.recipient} · {delivery.attempts}{" "}
									{delivery.attempts === 1 ? "attempt" : "attempts"}
									{delivery.error ? ` · ${delivery.error}` : ""}
								</p>
							</div>
							<StatusTag status="low">{delivery.channel}</StatusTag>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
