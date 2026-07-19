"use client";

import { useState } from "react";
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
import type { Availability } from "@generated/prisma/enums";
import { useLocationCascade } from "@/hooks/use-location-cascade";
import { toast } from "sonner";

export default function SignupPage() {
	const router = useRouter();
	const [role, setRole] = useState<"donor" | "hospital">("donor");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const cascade = useLocationCascade();
	const { regionId, stateId, cityId, regions, states, cities, locationId } =
		cascade;
	const [availability, setAvailability] = useState<Availability | "">("");
	const [receiveAlerts, setReceiveAlerts] = useState(true);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

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
		<div className="min-h-screen w-full flex items-center justify-center p-6 bg-background">
			<div className="absolute top-8 left-6 md:left-12">
				<Button
					asChild
					variant="outline"
					className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 bg-muted border-border px-4 py-2 h-10 rounded-2xl"
				>
					<Link href="/">
						<ArrowLeft className="h-4 w-4" />
						Back to Home
					</Link>
				</Button>
			</div>

			<Card className="w-full max-w-md rounded-3xl p-2 shadow-sm relative overflow-hidden">
				<div className="absolute inset-0 bg-[radial-gradient(#ef444408_0.8px,transparent_1px)] bg-[length:4px_4px] pointer-events-none" />

				<CardHeader className="text-center relative pb-2 pt-6">
					<div className="w-10 h-10 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-4 scale-100 hover:scale-105 transition-transform duration-300">
						<Heart className="h-5 w-5 text-white fill-current animate-pulse" />
					</div>
					<CardTitle className="text-3xl font-semibold tracking-tighter">
						Join the Network
					</CardTitle>
					<CardDescription className="text-sm text-muted-foreground mt-2">
						Register and start saving lives or requesting matches
					</CardDescription>
				</CardHeader>

				<CardContent className="p-6 pt-0">
					<div className="grid grid-cols-2 gap-2 bg-muted p-1.5 rounded-2xl border-border mb-8 relative">
						<button
							type="button"
							onClick={() => {
								setRole("donor");
								setError("");
							}}
							className={`py-3 text-sm font-medium rounded-xl transition-all duration-300 cursor-pointer ${
								role === "donor"
									? "bg-card text-brand shadow-sm font-semibold"
									: "text-muted-foreground hover:text-foreground"
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
									? "bg-card text-brand shadow-sm font-semibold"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							Hospital Partner
						</button>
					</div>

					{error && (
						<div className="p-4 mb-6 text-sm text-brand bg-brand-light rounded-2xl border border-brand/20">
							{error}
						</div>
					)}

					<form
						onSubmit={handleSubmit}
						className="space-y-6 relative"
					>
						<div>
							<label className="block text-xs font-mono tracking-wider text-muted-foreground uppercase mb-2">
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
								className="w-full px-4 py-3 bg-muted border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-ring"
								required
							/>
						</div>

						<div>
							<label className="block text-xs font-mono tracking-wider text-muted-foreground uppercase mb-2">
								Email Address *
							</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
								className="w-full px-4 py-3 bg-muted border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-ring"
								required
							/>
						</div>

						<div>
							<label className="block text-xs font-mono tracking-wider text-muted-foreground uppercase mb-2">
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
									className="w-full px-4 pr-12 py-3 bg-muted border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-ring"
									required
								/>
								<button
									type="button"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
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
									<label className="block text-xs font-mono tracking-wider text-muted-foreground uppercase mb-2">
										Region *
									</label>
									<select
										value={regionId}
										onChange={(e) =>
											cascade.selectRegion(e.target.value)
										}
										className="w-full px-4 py-3 bg-muted border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-ring"
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
									<label className="block text-xs font-mono tracking-wider text-muted-foreground uppercase mb-2">
										State *
									</label>
									<select
										value={stateId}
										onChange={(e) =>
											cascade.selectState(e.target.value)
										}
										disabled={!regionId}
										className="w-full px-4 py-3 bg-muted border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
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
									<label className="block text-xs font-mono tracking-wider text-muted-foreground uppercase mb-2">
										City / Area *
									</label>
									<select
										value={cityId}
										onChange={(e) =>
											cascade.selectCity(e.target.value)
										}
										disabled={!stateId}
										className="w-full px-4 py-3 bg-muted border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
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
									<label className="block text-xs font-mono tracking-wider text-muted-foreground uppercase mb-2">
										Availability (optional)
									</label>
									<select
										value={availability}
										onChange={(e) =>
											setAvailability(e.target.value as Availability | "")
										}
										className="w-full px-4 py-3 bg-muted border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-ring"
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
										className="h-4 w-4 rounded border-input text-brand focus:ring-ring"
									/>
									<span className="text-sm text-foreground">
										Receive emergency alerts
									</span>
								</label>
							</>
						)}

						<Button
							type="submit"
							disabled={isLoading}
							className="w-full py-6 font-medium rounded-2xl text-sm"
						>
							{isLoading
								? "Creating Account..."
								: `Register as ${role === "donor" ? "Donor" : "Hospital Partner"}`}
						</Button>
					</form>

					<div className="mt-8 pt-6 border-t border-border text-center">
						<p className="text-sm text-muted-foreground">
							Already registered?{" "}
							<Link
								href="/auth/login"
								className="font-medium text-brand hover:text-brand-hover"
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
