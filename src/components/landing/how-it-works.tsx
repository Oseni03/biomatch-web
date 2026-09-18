import React from 'react';
import { BellRing, Send, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
    return (
        <section id="how-it-works" className="py-20 md:py-28 px-4 sm:px-6 border-t border-[#141724] bg-[#07080d]">
            <div className="max-w-4xl mx-auto">
                {/* Section Question & Heading */}
                <div className="text-center mb-14">
                    <span className="text-xs font-semibold text-red-500 tracking-wider uppercase">
                        How does BioMATCH work?
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mt-2 mb-4">
                        From emergency alert to bedside donor.
                    </h2>
                    <p className="text-base sm:text-lg text-[#a6abbd] max-w-2xl mx-auto leading-relaxed">
                        A simple three-step loop built for zero friction when seconds count.
                    </p>
                </div>

                {/* 3 Steps Visual Flow */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                    {/* Step 1 */}
                    <div className="bg-[#0d0f18] border border-[#1a1c28] rounded-2xl p-6 relative">
                        <span className="text-xs font-mono font-bold text-[#72778f] block mb-4">01 / REQUEST</span>
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
                            <BellRing className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Hospital Requests</h3>
                        <p className="text-sm text-[#8b91a7] leading-relaxed">
                            When a patient needs blood urgently, the hospital triggers an emergency request specifying blood group and units.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-[#0d0f18] border border-[#1a1c28] rounded-2xl p-6 relative">
                        <span className="text-xs font-mono font-bold text-[#72778f] block mb-4">02 / NOTIFY</span>
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
                            <Send className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Nearby Donors Alerted</h3>
                        <p className="text-sm text-[#8b91a7] leading-relaxed">
                            Matching donors located within minutes of the facility instantly receive targeted SMS and WhatsApp alerts.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-[#0d0f18] border border-[#1a1c28] rounded-2xl p-6 relative">
                        <span className="text-xs font-mono font-bold text-[#72778f] block mb-4">03 / TRANSFUSE</span>
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Donor Arrives</h3>
                        <p className="text-sm text-[#8b91a7] leading-relaxed">
                            The responding donor arrives at the hospital, undergoes rapid verification, and donates blood directly to save the patient.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
