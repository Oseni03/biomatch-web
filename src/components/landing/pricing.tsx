"use client"

import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

export const Pricing: React.FC<{ portalHref?: string | null }> = ({
    portalHref,
}) => {
    const navigate = useRouter();

    return (
        <section id="pricing" className="py-20 md:py-28 px-4 sm:px-6 border-t border-[#141724] bg-[#07080d]">
            <div className="max-w-4xl mx-auto">
                {/* Section Question & Heading */}
                <div className="text-center mb-14">
                    <span className="text-xs font-semibold text-red-500 tracking-wider uppercase">
                        What does it cost?
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mt-2 mb-4">
                        Free for donors. Simple for hospitals.
                    </h2>
                    <p className="text-base sm:text-lg text-[#a6abbd] max-w-2xl mx-auto leading-relaxed">
                        Donors never pay to save a life. Hospitals invest a predictable monthly fee to maintain instant emergency dispatch.
                    </p>
                </div>

                {/* 2 Clean Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {/* Donors Card */}
                    <div className="bg-[#0d0f18] border border-[#1a1c28] rounded-2xl p-7 flex flex-col justify-between">
                        <div>
                            <div className="text-xs font-mono text-[#72778f] uppercase mb-1">Voluntary Donors</div>
                            <div className="text-3xl font-extrabold text-white mb-2">₦0 <span className="text-sm font-normal text-[#72778f]">/ Forever</span></div>
                            <p className="text-sm text-[#8b91a7] mb-6">
                                Direct community contribution. No fees, no hidden costs.
                            </p>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-2.5 text-sm text-[#e1e4ee]">
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>Free emergency alerts via SMS & WhatsApp</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-sm text-[#e1e4ee]">
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>Complimentary health check & refreshments</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-sm text-[#e1e4ee]">
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>Verified digital donor recognition</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            size="default"
                            onClick={() => navigate.push(portalHref ?? '/auth/signup')}
                            className="w-full"
                        >
                            {portalHref ? "Go to Your Portal" : "Become a Donor"}
                        </Button>
                    </div>

                    {/* Hospitals Card */}
                    <div className="bg-[#0d0f18] border border-red-500/30 rounded-2xl p-7 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
                        <div>
                            <div className="text-xs font-mono text-red-400 uppercase mb-1">Healthcare Facilities</div>
                            <div className="text-3xl font-extrabold text-white mb-2">₦100,000 <span className="text-sm font-normal text-[#72778f]">/ 5 donors</span></div>
                            <p className="text-sm text-[#8b91a7] mb-6">
                                Flat fee covering dispatch matching for up to 5 verified donors.
                            </p>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-2.5 text-sm text-[#e1e4ee]">
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>Unlimited emergency donor dispatch broadcasts</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-sm text-[#e1e4ee]">
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>Radius-based donor matching within 5–10km</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-sm text-[#e1e4ee]">
                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>24/7 emergency dispatch desk & lab priority</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="default"
                            onClick={() => navigate.push(portalHref ?? '/auth/signup?role=hospital')}
                            className="w-full"
                        >
                            {portalHref ? "Go to Your Portal" : "Register Hospital"}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};
