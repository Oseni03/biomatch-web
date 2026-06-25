"use client";

import { MapPin } from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import type { DonorStatus } from "@/lib/donor-types";

const LOCATIONS = [
	"Ikeja, Lagos",
	"Yaba, Lagos",
	"Lekki, Lagos",
	"Surulere, Lagos",
	"Victoria Island, Lagos",
	"Idi-Araba, Lagos",
];

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
}: LocationSettingsCardProps) {
	return (
		<Card className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
			<CardHeader className="p-0 pb-4 border-b border-gray-50 dark:border-zinc-800/60 mb-6">
				<CardTitle className="text-base font-bold flex items-center gap-2">
					<MapPin className="h-5 w-5 text-red-600" />
					Location and Availability Settings
				</CardTitle>
				<CardDescription className="text-xs text-gray-500 dark:text-zinc-400">
					Update your location and alert settings in real time
				</CardDescription>
			</CardHeader>

			<CardContent className="p-0">
				{settingsSuccess && (
					<div className="p-3 mb-4 text-xs text-green-700 bg-green-50 border border-green-200 rounded-2xl">
						{settingsSuccess}
					</div>
				)}

				<form onSubmit={onSave} className="space-y-4">
					<div>
						<label className="block text-[10px] font-mono uppercase text-gray-400 mb-1.5 tracking-wider text-left">
							Availability Status:
						</label>
						<select
							value={donorStatus}
							onChange={(e) =>
								onStatusChange(e.target.value as DonorStatus)
							}
							className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none"
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
						<label className="block text-[10px] font-mono uppercase text-gray-400 mb-1.5 tracking-wider text-left">
							Current Location (Lagos Area):
						</label>
						<select
							value={donorLocation}
							onChange={(e) => onLocationChange(e.target.value)}
							className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none"
						>
							{LOCATIONS.map((loc) => (
								<option key={loc} value={loc}>
									{loc}
								</option>
							))}
						</select>
					</div>

					<div>
						<div className="flex justify-between items-center text-[10px] font-mono uppercase text-gray-400 mb-1 tracking-wider">
							<span>Alert Radius Limit:</span>
							<span className="text-red-600 font-bold">
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
							className="w-full h-1 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600"
						/>
						<div className="flex justify-between text-[8px] text-gray-400 font-mono mt-1">
							<span>5 KM</span>
							<span>50 KM</span>
						</div>
					</div>

					<div className="pt-2 flex items-center justify-between border-t border-gray-50 dark:border-zinc-800/50">
						<div className="text-left">
							<span className="text-[10px] font-mono uppercase text-gray-400 block tracking-wider">
								SMS Fallback Alert
							</span>
							<span className="text-[9px] text-gray-400">
								Receive SMS if push unopened in 2m
							</span>
						</div>
						<input
							type="checkbox"
							checked={smsFallbackEnabled}
							onChange={(e) =>
								onSmsFallbackChange(e.target.checked)
							}
							className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 accent-red-600"
						/>
					</div>

					<button
						type="submit"
						className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition shadow active:scale-95"
					>
						Save Profile Settings
					</button>
				</form>
			</CardContent>
		</Card>
	);
}
