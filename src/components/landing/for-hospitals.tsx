"use client"

import React from 'react';
import { Clock, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

export const ForHospitals: React.FC = () => {
    const navigate = useRouter();

    return (
        <section id="for-hospitals" className="py-20 md:py-28 px-4 sm:px-6 border-t border-[#141724] bg-[#07080d]">
            <div className="max-w-4xl mx-auto">
                {/* Section Question & Heading */}
                <div className="text-center mb-12">
                    <span className="text-xs font-semibold text-red-500 tracking-wider uppercase">
                        Why would my hospital use this?
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mt-2 mb-4">
                        Never let an empty blood bank delay surgery.
                    </h2>
                    <p className="text-base sm:text-lg text-[#a6abbd] max-w-2xl mx-auto leading-relaxed">
                        Instantly alert screened, voluntary donors in your immediate district instead of making frantic phone calls while a patient bleeds.
                    </p>
                </div>

                {/* Minimal Comparison Visual */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                    <div className="bg-[#0d0f18] border border-[#1a1c28] rounded-2xl p-6">
                        <div className="flex items-center gap-2 text-xs font-mono text-[#72778f] uppercase mb-3">
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span>Traditional Response</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-2">45 to 120 Minutes</div>
                        <p className="text-sm text-[#8b91a7] leading-relaxed">
                            Calling distant family members, searching external banks, and navigating city gridlock while critical surgical windows close.
                        </p>
                    </div>

                    <div className="bg-[#0d0f18] border border-red-500/30 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-xl pointer-events-none" />
                        <div className="flex items-center gap-2 text-xs font-mono text-red-400 uppercase mb-3">
                            <Zap className="w-4 h-4 text-red-400" />
                            <span>With BioMATCH</span>
                        </div>
                        <div className="text-2xl font-bold text-red-400 mb-2">&lt; 8 Minutes</div>
                        <p className="text-sm text-[#8b91a7] leading-relaxed">
                            One broadcast reaches verified donors within your 5km radius. Responders arrive directly at your hematology lab.
                        </p>
                    </div>
                </div>

                {/* Action */}
                <div className="text-center">
                    <Button
                        variant="default"
                        size="lg"
                        onClick={() => navigate.push('/auth/signup?role=hospital')}
                    >
                        Register Hospital
                    </Button>
                </div>
            </div>
        </section>
    );
};
