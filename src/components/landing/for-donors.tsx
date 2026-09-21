"use client"

import React from 'react';
import { MessageSquare, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

export const ForDonors: React.FC = () => {
    const navigate = useRouter();

    return (
        <section id="for-donors" className="py-20 md:py-28 px-4 sm:px-6 border-t border-[#141724]">
            <div className="max-w-4xl mx-auto">
                {/* Section Question & Heading */}
                <div className="text-center mb-12">
                    <span className="text-xs font-semibold text-red-500 tracking-wider uppercase">
                        How can I help?
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mt-2 mb-4">
                        Give 15 minutes. Save a neighbor.
                    </h2>
                    <p className="text-base sm:text-lg text-[#a6abbd] max-w-2xl mx-auto leading-relaxed">
                        Register once as a voluntary donor. You will only be alerted when an emergency happens near your current area.
                    </p>
                </div>

                {/* Visual Mock: Simple SMS Alert & Assurances */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-[#0d0f18] border border-[#1a1c28] rounded-2xl p-6 sm:p-8">
                    {/* SMS Visual */}
                    <div className="bg-[#141724] border border-[#23273a] rounded-xl p-4 sm:p-5 shadow-inner">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#23273a] text-xs text-[#a6abbd] font-mono">
                            <MessageSquare className="w-3.5 h-3.5 text-red-400" />
                            <span>SMS ALERT • BioMATCH</span>
                        </div>
                        <p className="text-xs sm:text-sm text-white leading-relaxed font-sans">
                            &quot;URGENT: General Hospital Gbagada urgently requires 2 units of A+ blood for an emergency surgery. Distance: 1.8km. Reply 1 to accept.&quot;
                        </p>
                        <div className="mt-3 text-[11px] text-[#72778f] font-mono">
                            Delivery via SMS & WhatsApp • Zero data cost
                        </div>
                    </div>

                    {/* Points & Action */}
                    <div className="space-y-5">
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-2.5 text-sm text-[#e1e4ee]">
                                <div className="w-5 h-5 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3" />
                                </div>
                                <span>No app to download — works entirely on standard SMS and WhatsApp</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-sm text-[#e1e4ee]">
                                <div className="w-5 h-5 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3" />
                                </div>
                                <span>Zero spam — alerts are strictly sent for life-threatening emergencies</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-sm text-[#e1e4ee]">
                                <div className="w-5 h-5 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3" />
                                </div>
                                <span>Always volunteer and 100% free with medical supervision</span>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button
                                variant="default"
                                size="lg"
                                onClick={() => navigate.push('/auth/signup')}
                                className="w-full sm:w-auto"
                            >
                                Become a Donor
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
