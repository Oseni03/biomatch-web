"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ArrowLeft, Eye, EyeOff, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { signUpWithProfile } from "@/servers/auth";
import { AVAILABILITY_OPTIONS } from "@/lib/availability";
import type { Availability } from "@/generated/prisma/enums";
import { getLocations } from "@/servers/location";
import { toast } from "sonner";

export default function SignupPage() {
	const router = useRouter();
	const [role, setRole] = useState<"donor" | "hospital">("donor");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [locationId, setLocationId] = useState("");
	const [regionId, setRegionId] = useState("");
	const [stateId, setStateId] = useState("");
	const [cityId, setCityId] = useState("");
	const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);
	const [states, setStates] = useState<{ id: string; name: string }[]>([]);
	const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
	const [availability, setAvailability] = useState<Availability | "">("");
	const [receiveAlerts, setReceiveAlerts] = useState(true);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		getLocations(null).then(setRegions);
	}, []);

	useEffect(() => {
		if (regionId) {
			getLocations(regionId).then(setStates);
			setStateId("");
			setCityId("");
			setCities([]);
		}
	}, [regionId]);

	useEffect(() => {
		if (stateId) {
			getLocations(stateId).then(setCities);
			setCityId("");
		}
	}, [stateId]);

	useEffect(() => {
		if (cityId) {
			setLocationId(cityId);
		}
	}, [cityId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!name || !email || !password) {
			setError("Please complete all required fields");
			return;
		}

		if (role === "donor" && !locationId) {
			setError("Location is required for donors");
			return;
		}

		if (password.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		setIsLoading(true);

		const result = await signUpWithProfile({
			email,
			password,
			fullName: name,
			role,
			locationId: role === "donor" ? locationId || undefined : undefined,
			availability:
				role === "donor" ? availability || undefined : undefined,
			isActive: role === "donor" ? receiveAlerts : undefined,
		});

		if (result?.error) {
			setError(result.error);
			setIsLoading(false);
			return;
		}

		toast.success("Registration successful! You can now sign in.");
		router.push(`/${role}`);
	};

	return (
		<div className="min-h-screen w-full flex items-center justify-center p-6 bg-white dark:bg-zinc-950">
			<div className="absolute top-8 left-6 md:left-12">
				<Button
					asChild
					variant="outline"
					className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all duration-200 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 px-4 py-2 h-10 rounded-2xl"
				>
					<Link href="/">
						<ArrowLeft className="h-4 w-4" />
						Back to Home
					</Link>
				</Button>
			</div>

			<Card className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-2 shadow-sm relative overflow-hidden">
				<div className="absolute inset-0 bg-[radial-gradient(#ef444408_0.8px,transparent_1px)] bg-[length:4px_4px] pointer-events-none" />

				<CardHeader className="text-center relative pb-2 pt-6">
					<div className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 scale-100 hover:scale-105 transition-transform duration-300">
						<Heart className="h-5 w-5 text-white fill-current animate-pulse" />
					</div>
					<CardTitle className="text-3xl font-semibold tracking-tighter">
						Join the Network
					</CardTitle>
					<CardDescription className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
						Register and start saving lives or requesting matches
					</CardDescription>
				</CardHeader>

				<CardContent className="p-6 pt-0">
					<div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-zinc-950 p-1.5 rounded-2xl border border-gray-100 dark:border-zinc-800 mb-8 relative">
						<button
							type="button"
							onClick={() => {
								setRole("donor");
								setError("");
							}}
							className={`py-3 text-sm font-medium rounded-xl transition-all duration-300 cursor-pointer ${
								role === "donor"
									? "bg-white dark:bg-zinc-800 text-red-600 dark:text-white shadow-sm font-semibold"
									: "text-gray-500 hover:text-gray-800 dark:hover:text-zinc-300"
							}`}
						>
							Become a Donor
						</button>
						<button
							type="button"
							onClick={() => {
								setRole("hospital");
								setError("");
							}}
							className={`py-3 text-sm font-medium rounded-xl transition-all duration-300 cursor-pointer ${
								role === "hospital"
									? "bg-white dark:bg-zinc-800 text-red-600 dark:text-white shadow-sm font-semibold"
									: "text-gray-500 hover:text-gray-800 dark:hover:text-zinc-300"
							}`}
						>
							Hospital Partner
						</button>
					</div>

					{error && (
						<div className="p-4 mb-6 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30">
							{error}
						</div>
					)}

					<form
						onSubmit={handleSubmit}
						className="space-y-6 relative"
					>
						<div>
							<label className="block text-xs font-mono tracking-wider dark:text-zinc-400 uppercase mb-2">
								{role === "donor"
									? "Full Name"
									: "Hospital Name"}{" "}
								*
							</label>
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder={
									role === "donor"
										? "e.g. David Adebayo"
										: "e.g. Red Cross Hospital"
								}
								className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
								required
							/>
						</div>

						<div>
							<label className="block text-xs font-mono tracking-wider dark:text-zinc-400 uppercase mb-2">
								Email Address *
							</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
								className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
								required
							/>
						</div>

						<div>
							<label className="block text-xs font-mono tracking-wider dark:text-zinc-400 uppercase mb-2">
								Password *
							</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									placeholder="At least 6 characters"
									className="w-full px-4 pr-12 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
									required
								/>
								<button
									type="button"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						{role === "donor" && (
							<>
								<div>
									<label className="block text-xs font-mono tracking-wider dark:text-zinc-400 uppercase mb-2">
										Region *
									</label>
									<select
										value={regionId}
										onChange={(e) =>
											setRegionId(e.target.value)
										}
										className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
										required
									>
										<option value="">Select region</option>
										{regions.map((r) => (
											<option key={r.id} value={r.id}>
												{r.name}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-xs font-mono tracking-wider dark:text-zinc-400 uppercase mb-2">
										State *
									</label>
									<select
										value={stateId}
										onChange={(e) =>
											setStateId(e.target.value)
										}
										disabled={!regionId}
										className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-600 disabled:opacity-50"
										required
									>
										<option value="">Select state</option>
										{states.map((s) => (
											<option key={s.id} value={s.id}>
												{s.name}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-xs font-mono tracking-wider dark:text-zinc-400 uppercase mb-2">
										City / Area *
									</label>
									<select
										value={cityId}
										onChange={(e) =>
											setCityId(e.target.value)
										}
										disabled={!stateId}
										className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-600 disabled:opacity-50"
										required
									>
										<option value="">Select city</option>
										{cities.map((c) => (
											<option key={c.id} value={c.id}>
												{c.name}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-xs font-mono tracking-wider dark:text-zinc-400 uppercase mb-2">
										Availability (optional)
									</label>
									<select
										value={availability}
										onChange={(e) =>
											setAvailability(e.target.value as Availability | "")
										}
										className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
									>
										<option value="">
											Select availability
										</option>
										{AVAILABILITY_OPTIONS.map((opt) => (
											<option
												key={opt.value}
												value={opt.value}
											>
												{opt.label}
											</option>
										))}
									</select>
								</div>
								<label className="flex items-center gap-3 cursor-pointer">
									<input
										type="checkbox"
										checked={receiveAlerts}
										onChange={(e) =>
											setReceiveAlerts(e.target.checked)
										}
										className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-400"
									/>
									<span className="text-sm text-gray-700 dark:text-zinc-300">
										Receive emergency alerts
									</span>
								</label>
							</>
						)}

						<Button
							type="submit"
							disabled={isLoading}
							className="w-full py-6 text-center text-white bg-red-600 hover:bg-red-700 hover:scale-[1.01] active:scale-95 disabled:opacity-50 border border-transparent font-medium rounded-2xl shadow-sm transition-all duration-300 cursor-pointer text-sm"
						>
							{isLoading
								? "Creating Account..."
								: `Register as ${role === "donor" ? "Donor" : "Hospital Partner"}`}
						</Button>
					</form>

					<div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 text-center">
						<p className="text-sm text-gray-500 dark:text-zinc-400">
							Already registered?{" "}
							<Link
								href="/auth/login"
								className="font-medium text-red-600 hover:text-red-700"
							>
								Sign In
							</Link>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
