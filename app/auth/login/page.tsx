"use client";

import { useState } from "react";
import Link from "next/link";
import { Droplet, Loader2 } from "lucide-react";
import { loginWithRole } from "@/servers/auth";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		const result = await loginWithRole(email, password);

		if (result?.error) {
			setError(result.error);
			setLoading(false);
		}
	};

	return (
		<main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
			<div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8">
				<div className="flex items-center gap-2.5">
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-600 to-rose-500">
						<Droplet className="h-5 w-5 text-white" fill="white" />
					</div>
					<p className="text-lg font-bold text-gray-900">BioMatch</p>
				</div>

				<h1 className="mt-6 text-xl font-semibold text-gray-900">
					Log in
				</h1>

				<form onSubmit={handleSubmit} className="mt-5 space-y-4">
					<div>
						<label className="text-xs font-medium text-gray-500">
							Email
						</label>
						<input
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
						/>
					</div>
					<div>
						<label className="text-xs font-medium text-gray-500">
							Password
						</label>
						<input
							type="password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
						/>
					</div>

					{error && <p className="text-xs text-red-600">{error}</p>}

					<button
						type="submit"
						disabled={loading}
						className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-600 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
					>
						{loading && (
							<Loader2 className="h-4 w-4 animate-spin" />
						)}
						Log in
					</button>
				</form>

				<p className="mt-5 text-center text-xs text-gray-500">
					Don&apos;t have an account?{" "}
					<Link
						href="/auth/signup"
						className="font-medium text-rose-600"
					>
						Sign up
					</Link>
				</p>
			</div>
		</main>
	);
}
