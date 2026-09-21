import React from 'react';
import { ShieldCheck, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { BloodDropIcon } from "@/components/brand/blood-drop-icon";

export const Footer: React.FC = () => {
	return (
		<footer className="bg-[#040508] border-t border-[#1a1c28] text-xs text-[#72778f] py-12 px-4 sm:px-6">
			<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
				{/* Brand Col (2 cols) */}
				<div className="md:col-span-2 space-y-4">
					<Link href="/" className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#dc2626] to-[#991b1b] flex items-center justify-center shadow-[0_0_14px_rgba(220,38,38,0.4)]">
							<BloodDropIcon className="w-4 h-4 text-white" />
						</div>
						<span className="font-extrabold text-base tracking-tight text-white">
							Bio<span className="text-[#dc2626]">MATCH</span>
						</span>
					</Link>

					<p className="text-xs text-[#a6abbd] leading-relaxed max-w-sm">
						Nigeria&apos;s emergency blood logistics network. Connecting accredited hospitals, verified cold-storage bank reserves, and voluntary on-call donors within an 8-minute response corridor.
					</p>

					<div className="flex items-center gap-2 text-xs text-emerald-400">
						<ShieldCheck className="w-4 h-4 shrink-0" />
						<span>Fully compliant with NBTS directives & NDPR 2023.</span>
					</div>
				</div>

				{/* Hospitals Column */}
				<div className="space-y-2.5">
					<h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
						For Hospitals
					</h4>
					<ul className="space-y-2">
						<li>
							<Link href="/auth/signup?role=hospital" className="hover:text-white transition-colors">
								Onboard Facility
							</Link>
						</li>
						<li>
							<a href="#pricing" className="hover:text-white transition-colors">
								Facility Tiers & Pricing
							</a>
						</li>
						<li>
							<Link href="/auth/login" className="hover:text-white transition-colors">
								Physician Command Login
							</Link>
						</li>
						<li>
							<span className="text-[#555a70]">Inter-Facility API (HL7/FHIR)</span>
						</li>
					</ul>
				</div>

				{/* Donors Column */}
				<div className="space-y-2.5">
					<h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
						For Donors
					</h4>
					<ul className="space-y-2">
						<li>
							<Link href="/auth/signup" className="hover:text-white transition-colors">
								Register as Volunteer
							</Link>
						</li>
						<li>
							<Link href="/auth/login" className="hover:text-white transition-colors">
								Donor Pass Sign In
							</Link>
						</li>
						<li>
							<a href="#why-it-matters" className="hover:text-white transition-colors">
								Eligibility Guidelines
							</a>
						</li>
						<li>
							<span className="text-[#555a70]">Nutrition Support Voucher</span>
						</li>
					</ul>
				</div>

				{/* Emergency Desk Column */}
				<div className="space-y-2.5">
					<h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
						Emergency Desk
					</h4>
					<ul className="space-y-2">
						<li className="flex items-center gap-1.5 text-white">
							<Phone className="w-3.5 h-3.5 text-[#dc2626]" />
							<span>0800-BIOMATCH</span>
						</li>
						<li className="flex items-center gap-1.5 text-[#a6abbd]">
							<Mail className="w-3.5 h-3.5 text-[#60a5fa]" />
							<span>emergency@biomatch.ng</span>
						</li>
						<li className="text-[11px] text-[#72778f]">
							24/7 Clinical Triage Hotline
						</li>
					</ul>
				</div>
			</div>

			<div className="max-w-7xl mx-auto pt-6 border-t border-[#1a1c28] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
				<div>
					© {new Date().getFullYear()} BioMATCH Nigeria. Built to save lives across Nigerian emergency corridors.
				</div>
				<div className="flex items-center gap-6">
					<a href="#" className="hover:text-white">Privacy Policy</a>
					<a href="#" className="hover:text-white">Terms of Clinical Custody</a>
					<a href="#" className="hover:text-white">NBSC Guidelines</a>
				</div>
			</div>
		</footer>
	);
};
