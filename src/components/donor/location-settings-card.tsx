"use client";

import { MapPin } from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { DonorStatus } from "@/lib/donor-types";

interface LocationSettingsCardProps {
	donorStatus: DonorStatus;
	onStatusChange: (status: DonorStatus) => void;
	donorLocation: string;
	onLocationChange: (location: string) => void;
	maxRadius: number;
	onRadiusChange: (radius: number) => void;
	smsFallbackEnabled: boolean;
	onSmsFallbackChange: (enabled: boolean) => void;
	settingsSuccess: string;
	onSave: (e: React.FormEvent) => void;
	locations: string[];
}

export function LocationSettingsCard({
	donorStatus,
	onStatusChange,
	donorLocation,
	onLocationChange,
	maxRadius,
	onRadiusChange,
	smsFallbackEnabled,
	onSmsFallbackChange,
	settingsSuccess,
	onSave,
	locations,
}: LocationSettingsCardProps) {
	return (
		<Card className="bg-card border-border rounded-xl p-6 shadow-sm transition-shadow hover:shadow-card-hover">
			<CardHeader className="p-0 pb-4 border-b border-border mb-6">
				<CardTitle className="text-base font-bold flex items-center gap-2">
					<MapPin className="h-5 w-5 text-brand" />
					Location and Availability Settings
				</CardTitle>
				<CardDescription className="text-xs text-muted-foreground">
					Update your location and alert settings in real time
				</CardDescription>
			</CardHeader>

			<CardContent className="p-0">
				{settingsSuccess && (
					<div className="p-3 mb-4 text-xs text-status-ok bg-status-ok-bg border border-status-ok/20 rounded-2xl">
						{settingsSuccess}
					</div>
				)}

				<form onSubmit={onSave} className="space-y-4">
					<div>
						<label className="block text-[10px] font-mono uppercase text-muted-foreground mb-1.5 tracking-wider text-left">
							Availability Status:
						</label>
						<select
							value={donorStatus}
							onChange={(e) =>
								onStatusChange(e.target.value as DonorStatus)
							}
							className="w-full px-3 py-2 bg-muted border-border rounded-xl text-xs focus:outline-none"
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
						<label className="block text-[10px] font-mono uppercase text-muted-foreground mb-1.5 tracking-wider text-left">
							Current Location (Lagos Area):
						</label>
						<select
							value={donorLocation}
							onChange={(e) => onLocationChange(e.target.value)}
							className="w-full px-3 py-2 bg-muted border-border rounded-xl text-xs focus:outline-none"
						>
							{locations.length === 0 && (
								<option value="">No locations available</option>
							)}
							{locations.map((loc) => (
								<option key={loc} value={loc}>
									{loc}
								</option>
							))}
						</select>
					</div>

					<div>
						<div className="flex justify-between items-center text-[10px] font-mono uppercase text-muted-foreground mb-1 tracking-wider">
							<span>Alert Radius Limit:</span>
							<span className="text-brand font-bold">
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
								onRadiusChange(Number(e.target.value))
							}
							className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-brand"
						/>
						<div className="flex justify-between text-[8px] text-muted-foreground font-mono mt-1">
							<span>5 KM</span>
							<span>50 KM</span>
						</div>
					</div>

					<div className="pt-2 flex items-center justify-between border-t border-border">
						<div className="text-left">
							<span className="text-[10px] font-mono uppercase text-muted-foreground block tracking-wider">
								SMS Fallback Alert
							</span>
							<span className="text-[9px] text-muted-foreground">
								Receive SMS if push unopened in 2m
							</span>
						</div>
						<Switch
							checked={smsFallbackEnabled}
							onCheckedChange={onSmsFallbackChange}
						/>
					</div>

					<Button type="submit" className="w-full">
						Save Profile Settings
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
