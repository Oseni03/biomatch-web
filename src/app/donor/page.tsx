import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DonorDashboardPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login?callbackUrl=/donor");
	}

	return (
		<div className="mx-auto w-full max-w-2xl p-6">
			<Card>
				<CardHeader>
					<CardTitle>Welcome, {session.user.name ?? "donor"}</CardTitle>
					<CardDescription>
						You are signed in. Your session persists across reloads.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<dl className="space-y-2 text-sm">
						<div className="flex justify-between gap-4">
							<dt className="text-muted-foreground">User ID</dt>
							<dd className="break-all">{session.user.id}</dd>
						</div>
						<div className="flex justify-between gap-4">
							<dt className="text-muted-foreground">Email</dt>
							<dd className="break-all">{session.user.email}</dd>
						</div>
						<div className="flex justify-between gap-4">
							<dt className="text-muted-foreground">Session ID</dt>
							<dd className="break-all">{session.session.id}</dd>
						</div>
					</dl>
				</CardContent>
			</Card>
		</div>
	);
}
