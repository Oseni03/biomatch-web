"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Building2,
	Heart,
	Radio,
	ArrowRight,
	ShieldCheck,
	Clock,
	CheckCircle2,
	MessageSquare,
	Sparkles,
	Zap,
	PhoneCall,
	Activity,
	MapPin,
	Send,
	RotateCcw,
} from 'lucide-react';
import { Button } from '../ui/button';
import { BloodDropIcon } from "@/components/brand/blood-drop-icon";
import { EASE_SMOOTH } from "@/lib/animations";
import { useRouter } from 'next/navigation';

interface SimulatedDonor {
	id: string;
	name: string;
	bloodType: string;
	distance: string;
	area: string;
	status: 'standby' | 'alerted' | 'accepted' | 'en_route';
	x: string; // percentage
	y: string; // percentage
	isCompatible: boolean;
}

export const Hero: React.FC = () => {
	const navigate = useRouter();
	const [simulationState, setSimulationState] = useState<'idle' | 'dispatching' | 'matched'>('idle');
	const [activeTab, setActiveTab] = useState<'radar' | 'dispatch_preview'>('radar');
	const [selectedBloodType, setSelectedBloodType] = useState<string>('O−');

	// Simulated donor pool in Lagos
	const donors: SimulatedDonor[] = [
		{
			id: 'd1',
			name: 'Ayomide O.',
			bloodType: 'O−',
			distance: '1.2 km',
			area: 'Surulere',
			status: simulationState === 'idle' ? 'standby' : simulationState === 'dispatching' ? 'alerted' : 'en_route',
			x: '20%',
			y: '30%',
			isCompatible: true,
		},
		{
			id: 'd2',
			name: 'Chidi E.',
			bloodType: 'O−',
			distance: '2.4 km',
			area: 'Yaba Tech',
			status: simulationState === 'idle' ? 'standby' : simulationState === 'dispatching' ? 'alerted' : 'accepted',
			x: '80%',
			y: '28%',
			isCompatible: true,
		},
		{
			id: 'd3',
			name: 'Fatima B.',
			bloodType: 'A+',
			distance: '3.1 km',
			area: 'Ebute Metta',
			status: 'standby',
			x: '24%',
			y: '74%',
			isCompatible: false,
		},
		{
			id: 'd4',
			name: 'Emeka K.',
			bloodType: 'O−',
			distance: '3.8 km',
			area: 'Lagos Island',
			status: simulationState === 'idle' ? 'standby' : 'alerted',
			x: '76%',
			y: '76%',
			isCompatible: true,
		},
	];

	const handleSimulateDispatch = () => {
		if (simulationState === 'dispatching') return;

		setSimulationState('dispatching');
		setTimeout(() => {
			setSimulationState('matched');
		}, 1800);
	};

	const handleResetSimulation = () => {
		setSimulationState('idle');
	};

	return (
		<section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6">
			{/* Background Gradients & Micro Mesh Pattern */}
			<div className="absolute inset-0 pointer-events-none -z-10">
				{/* Soft atmospheric ambient red glow */}
				<div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42rem] h-[28rem] bg-gradient-to-b from-red-600/15 via-rose-600/10 to-transparent rounded-full blur-3xl" />
				{/* Secondary subtle cool blue-slate backdrop */}
				<div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl" />
				<div className="absolute top-1/3 right-1/4 w-96 h-96 bg-red-950/20 rounded-full blur-3xl" />

				{/* Technical dot grid pattern */}
				<div
					className="absolute inset-0 opacity-[0.14]"
					style={{
						backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
						backgroundSize: '24px 24px',
						maskImage: 'radial-gradient(ellipse 70% 60% at 50% 35%, #000 40%, transparent 100%)',
						WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 35%, #000 40%, transparent 100%)',
					}}
				/>
			</div>

			<div className="max-w-6xl mx-auto">

				{/* Hero Title & Value Proposition */}
				<div className="text-center max-w-4xl mx-auto mb-10 mt-16">
					<motion.h1
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.55, delay: 0.1, ease: EASE_SMOOTH }}
						className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6"
					>
						Find Screened Donors.
						<br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-red-300">
							In 14 Minutes or Less.
						</span>
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.55, delay: 0.2, ease: EASE_SMOOTH }}
						className="text-lg sm:text-xl text-[#9ea4bc] max-w-2xl mx-auto leading-relaxed mb-8"
					>
						BioMATCH connects hospital surgical wards with nearby pre-screened community blood donors
						the instant a shortage strikes, dispatched via high-priority WhatsApp and SMS.
					</motion.p>

					{/* Action CTAs */}
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.55, delay: 0.3, ease: EASE_SMOOTH }}
						className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-5"
					>
						<Button
							variant="default"
							size="lg"
							onClick={() => navigate.push('/auth/signup?role=hospital')}
							className="w-full sm:w-auto px-7 py-3.5 text-sm sm:text-base font-bold shadow-[0_0_28px_rgba(220,38,38,0.35)] hover:shadow-[0_0_36px_rgba(220,38,38,0.5)] transition-all flex items-center justify-center gap-2 group"
						>
							<Building2 className="w-4 h-4" />
							<span>Register Hospital Desk</span>
							<ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
						</Button>

						<Button
							variant="outline"
							size="lg"
							onClick={() => navigate.push('/auth/signup')}
							className="w-full sm:w-auto px-7 py-3.5 text-sm sm:text-base font-bold bg-[#0d0f18]/80 hover:bg-[#151926] border-[#222738] hover:border-red-500/40 text-white transition-all flex items-center justify-center gap-2"
						>
							<Heart className="w-4 h-4 text-red-500 fill-red-500/20" />
							<span>Become a Voluntary Donor</span>
						</Button>
					</motion.div>

					{/* Micro Assurance Strip */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className="flex flex-wrap items-center justify-center gap-y-2 gap-x-5 text-xs text-[#72778f]"
					>
						<div className="flex items-center gap-1.5">
							<ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
							<span>100% Voluntary & Free</span>
						</div>
						<span className="hidden sm:inline text-[#23273a]">•</span>
						<div className="flex items-center gap-1.5">
							<MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
							<span>Zero-app friction (SMS + WhatsApp)</span>
						</div>
						<span className="hidden sm:inline text-[#23273a]">•</span>
						<div className="flex items-center gap-1.5">
							<Clock className="w-3.5 h-3.5 text-red-400" />
							<span>Emergency 24/7 Automated Dispatch</span>
						</div>
					</motion.div>
				</div>

				{/* MODERN HERO VISUAL: Live Radar & Dispatch Matrix */}
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.65, delay: 0.4, ease: EASE_SMOOTH }}
					className="relative max-w-4xl mx-auto rounded-3xl bg-[#090b13]/90 border border-[#1d2233] shadow-[0_24px_64px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden"
				>
					{/* Top Bar with Status and View Switcher */}
					<div className="px-4 sm:px-6 py-3.5 bg-[#0e111b]/80 border-b border-[#1a1f30] flex flex-wrap items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-1.5">
								<span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
								<span className="text-xs font-bold uppercase tracking-wider text-white">
									Live Dispatch Simulation
								</span>
							</div>
							<span className="text-xs px-2 py-0.5 rounded-md bg-red-950/60 text-red-300 border border-red-800/40 font-mono font-semibold">
								Priority 1: {selectedBloodType} Emergency
							</span>
						</div>

						{/* Quick blood type selector for simulation */}
						<div className="flex items-center gap-1.5 text-xs text-[#72778f]">
							<span className="hidden sm:inline text-[11px]">Request Blood:</span>
							{(['O−', 'O+', 'B+', 'A+'] as const).map((bt) => (
								<button
									key={bt}
									type="button"
									onClick={() => setSelectedBloodType(bt)}
									className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold transition-colors cursor-pointer ${selectedBloodType === bt
										? 'bg-red-600 text-white'
										: 'bg-[#141724] text-[#8b91a7] hover:text-white'
										}`}
								>
									{bt}
								</button>
							))}
						</div>
					</div>

					{/* Interactive Stage */}
					<div className="relative h-80 sm:h-96 w-full bg-[#070910] flex items-center justify-center overflow-hidden select-none">
						{/* Radar Background Circles */}
						<div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-red-500/10 pointer-events-none" />
						<div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-red-500/15 pointer-events-none" />
						<div className="absolute w-96 h-96 sm:w-[28rem] sm:h-[28rem] rounded-full border border-white/[0.03] pointer-events-none" />

						{/* Crosshairs */}
						<div className="absolute w-full h-[1px] bg-white/[0.04] pointer-events-none" />
						<div className="absolute h-full w-[1px] bg-white/[0.04] pointer-events-none" />

						{/* Distance Markers */}
						<span className="absolute top-[28%] left-1/2 translate-x-2 text-[9px] font-mono text-[#444a60] pointer-events-none">
							1.0 km geofence
						</span>
						<span className="absolute top-[12%] left-1/2 translate-x-2 text-[9px] font-mono text-[#444a60] pointer-events-none">
							3.0 km geofence
						</span>

						{/* Rotating Radar Sweep Beam */}
						<div
							className="absolute inset-0 pointer-events-none origin-center opacity-40"
							style={{
								background:
									'conic-gradient(from 0deg at 50% 50%, rgba(220, 38, 38, 0.25) 0deg, rgba(220, 38, 38, 0.05) 45deg, transparent 60deg, transparent 360deg)',
								animation: 'spin 7s linear infinite',
							}}
						/>

						{/* Pulsing Radial Broadcast Waves when Dispatching */}
						{simulationState !== 'idle' && (
							<>
								<div className="absolute w-44 h-44 rounded-full border-2 border-red-500/40 animate-ping pointer-events-none" />
								<div
									className="absolute w-72 h-72 rounded-full border border-red-500/30 animate-ping pointer-events-none"
									style={{ animationDuration: '2.5s' }}
								/>
							</>
						)}

						{/* SVG Connection Lines */}
						<svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
							{donors.map((donor) => {
								const isDispatched = simulationState !== 'idle' && donor.isCompatible;
								return (
									<line
										key={`line-${donor.id}`}
										x1="50%"
										y1="50%"
										x2={donor.x}
										y2={donor.y}
										stroke={isDispatched ? '#ef4444' : '#272d42'}
										strokeOpacity={isDispatched ? 0.8 : 0.4}
										strokeWidth={isDispatched ? 2 : 1}
										strokeDasharray={isDispatched ? '4 4' : '3 3'}
										className={isDispatched ? 'transition-all duration-500' : ''}
									/>
								);
							})}
						</svg>

						{/* CENTER: HOSPITAL COMMAND NODE */}
						<div className="relative z-20 flex flex-col items-center">
							<div className="relative">
								{/* Hospital Node Ring */}
								<div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#111420] border-2 border-red-500/80 flex items-center justify-center text-red-500 shadow-[0_0_35px_rgba(220,38,38,0.4)] transition-all">
									<Building2 className="w-7 h-7 sm:w-8 sm:h-8" />
								</div>
								<span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
									<span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600 border-2 border-[#070910]" />
								</span>
							</div>

							<div className="mt-2 text-center bg-[#0d101b]/90 px-3 py-1 rounded-lg border border-[#1f2438] backdrop-blur-sm shadow-md">
								<div className="text-xs font-bold text-white flex items-center gap-1">
									<span>LUTH Emergency Ward</span>
								</div>
								<div className="text-[10px] text-red-400 font-mono font-semibold flex items-center justify-center gap-1">
									<BloodDropIcon className="size-3" />
									<span>Emergency: 2 Units {selectedBloodType}</span>
								</div>
							</div>
						</div>

						{/* SURROUNDING DONOR NODES */}
						{donors.map((donor) => {
							const isMatched = donor.isCompatible && simulationState === 'matched';
							const isAlerted = donor.isCompatible && simulationState === 'dispatching';

							return (
								<div
									key={donor.id}
									style={{ top: donor.y, left: donor.x }}
									className="absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-300"
								>
									<div
										className={`group relative flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all shadow-lg cursor-pointer ${isMatched
											? 'bg-emerald-950/80 border-emerald-500 text-white shadow-emerald-950/50 scale-105'
											: isAlerted
												? 'bg-red-950/80 border-red-500 text-white shadow-red-950/50 animate-pulse'
												: donor.isCompatible
													? 'bg-[#10131e]/90 border-[#22283d] text-[#e2e5f0] hover:border-red-500/40'
													: 'bg-[#0d0f17]/70 border-[#1a1d29] text-[#72778f] opacity-75'
											}`}
									>
										<div
											className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${isMatched
												? 'bg-emerald-500 text-black'
												: isAlerted
													? 'bg-red-500 text-white'
													: donor.isCompatible
														? 'bg-red-500/15 text-red-400 border border-red-500/30'
														: 'bg-[#181b28] text-[#555a6d]'
												}`}
										>
											{donor.bloodType}
										</div>

										<div className="text-left">
											<div className="text-[11px] font-bold leading-tight flex items-center gap-1">
												<span>{donor.name}</span>
												{isMatched && <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />}
											</div>
											<div className="text-[9px] font-mono text-[#8b91a7]">
												{donor.distance} • {donor.area}
											</div>
										</div>
									</div>

									{/* Status Indicator Tag */}
									{isMatched && (
										<div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-bold text-emerald-400 whitespace-nowrap shadow-sm">
											{donor.status === 'en_route' ? 'En Route (8m)' : 'Accepted'}
										</div>
									)}
									{isAlerted && (
										<div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[9px] font-bold text-red-400 whitespace-nowrap">
											WhatsApp Paged
										</div>
									)}
								</div>
							);
						})}

						{/* FLOATING LIVE FEED OVERLAY: Simulated WhatsApp Dispatch */}
						<div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-30 max-w-[260px] sm:max-w-xs">
							<AnimatePresence mode="wait">
								{simulationState === 'idle' ? (
									<motion.div
										key="idle-msg"
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -8 }}
										className="p-2.5 sm:p-3 rounded-2xl bg-[#0c0f18]/90 border border-[#1e2336] backdrop-blur-md shadow-xl text-left"
									>
										<div className="flex items-center gap-2 text-[11px] font-semibold text-[#a6abbd]">
											<Radio className="w-3.5 h-3.5 text-red-400" />
											<span>Ready for Instant Dispatch</span>
										</div>
										<p className="text-[10px] text-[#6d738a] mt-1 leading-snug">
											Click below to test live emergency broadcasting to screened donors within 5 km.
										</p>
									</motion.div>
								) : simulationState === 'dispatching' ? (
									<motion.div
										key="dispatch-msg"
										initial={{ opacity: 0, scale: 0.95 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.95 }}
										className="p-3 rounded-2xl bg-red-950/80 border border-red-500/50 backdrop-blur-md shadow-xl text-left"
									>
										<div className="flex items-center gap-2 text-[11px] font-bold text-white">
											<Zap className="w-3.5 h-3.5 text-yellow-400 animate-bounce" />
											<span>Broadcasting Urgent Page...</span>
										</div>
										<p className="text-[10px] text-red-200 mt-1 leading-snug">
											High-priority WhatsApp & SMS sent to 3 matched {selectedBloodType} donors.
										</p>
									</motion.div>
								) : (
									<motion.div
										key="matched-msg"
										initial={{ opacity: 0, scale: 0.95 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.95 }}
										className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 backdrop-blur-md shadow-xl text-left"
									>
										<div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300">
											<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
											<span>Donor En Route (8 min ETA)</span>
										</div>
										<p className="text-[10px] text-emerald-100/80 mt-1 leading-snug">
											Ayomide O. (Surulere) confirmed response via WhatsApp. Blood bank notified.
										</p>
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						{/* FLOATING ACTION CONTROL: Test Dispatch Button */}
						<div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-30 flex items-center gap-2">
							{simulationState !== 'idle' && (
								<button
									type="button"
									onClick={handleResetSimulation}
									className="p-2.5 rounded-xl bg-[#141724] border border-[#23283b] text-[#8b91a7] hover:text-white hover:bg-[#1a1f30] transition-colors cursor-pointer shadow-lg"
									title="Reset simulation"
									aria-label="Reset emergency dispatch simulation"
								>
									<RotateCcw className="w-4 h-4" />
								</button>
							)}

							<button
								type="button"
								onClick={handleSimulateDispatch}
								disabled={simulationState === 'dispatching'}
								className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg cursor-pointer ${simulationState === 'dispatching'
									? 'bg-red-700 text-white opacity-80 cursor-wait'
									: simulationState === 'matched'
										? 'bg-emerald-600 hover:bg-emerald-500 text-white'
										: 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50'
									}`}
							>
								{simulationState === 'dispatching' ? (
									<>
										<span className="w-2 h-2 rounded-full bg-white animate-ping" />
										<span>Broadcasting...</span>
									</>
								) : simulationState === 'matched' ? (
									<>
										<CheckCircle2 className="w-3.5 h-3.5" />
										<span>Trigger Another Alert</span>
									</>
								) : (
									<>
										<Send className="w-3.5 h-3.5" />
										<span>Simulate Emergency Broadcast</span>
									</>
								)}
							</button>
						</div>
					</div>

					{/* Bottom Telemetry & Trust Bar */}
					<div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[#161a29] bg-[#090b12] border-t border-[#161a29]">
						<div className="p-4 text-center sm:text-left">
							<div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
								&lt; 14 <span className="text-sm font-sans font-normal text-red-400">mins</span>
							</div>
							<div className="text-[11px] text-[#72778f] font-medium mt-0.5">
								Avg. Emergency Response Time
							</div>
						</div>

						<div className="p-4 text-center sm:text-left">
							<div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
								100<span className="text-sm font-sans font-normal text-emerald-400">%</span>
							</div>
							<div className="text-[11px] text-[#72778f] font-medium mt-0.5">
								Pre-screened & Genotyped
							</div>
						</div>

						<div className="p-4 text-center sm:text-left">
							<div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
								0<span className="text-sm font-sans font-normal text-blue-400">₦</span>
							</div>
							<div className="text-[11px] text-[#72778f] font-medium mt-0.5">
								Fee for Voluntary Donors
							</div>
						</div>

						<div className="p-4 text-center sm:text-left">
							<div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
								24/7
							</div>
							<div className="text-[11px] text-[#72778f] font-medium mt-0.5">
								Automated Dispatch Corridor
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
};

