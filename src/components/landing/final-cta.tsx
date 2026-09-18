"use client"

import React from 'react';
import { Phone } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

export const FinalCTA: React.FC = () => {
    const navigate = useRouter();

    return (
        <section id="final-cta" className="py-20 md:py-28 px-4 sm:px-6 border-t border-[#141724] relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-red-600/[0.08] rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl mx-auto text-center relative z-10">
                {/* Section Question & Heading */}
                <span className="text-xs font-semibold text-red-500 tracking-wider uppercase">
                    What should I do next?
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mt-2 mb-4">
                    Be the reason someone survives today.
                </h2>
                <p className="text-base sm:text-lg text-[#a6abbd] max-w-xl mx-auto leading-relaxed mb-8">
                    Join the network connecting hospitals and voluntary donors across Nigeria before an emergency occurs.
                </p>

                {/* Dual Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
                    <Button
                        variant="default"
                        size="lg"
                        onClick={() => navigate.push('/auth/signup?role=hospital')}
                        className="w-full sm:w-auto px-8"
                    >
                        Register Hospital
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate.push('/auth/signup')}
                        className="w-full sm:w-auto px-8"
                    >
                        Become a Donor
                    </Button>
                </div>

                {/* 24/7 Emergency Line */}
                <div className="inline-flex items-center gap-2 text-xs text-[#72778f] font-mono">
                    <Phone className="w-3.5 h-3.5 text-red-500" />
                    <span>24/7 Clinical Hotline: 0800-BIOMATCH</span>
                </div>
            </div>
        </section>
    );
};
