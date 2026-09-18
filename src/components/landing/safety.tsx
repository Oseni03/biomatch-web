import React from 'react';
import { ShieldCheck, Stethoscope, Lock } from 'lucide-react';

export const Safety: React.FC = () => {
    return (
        <section id="safety" className="py-20 md:py-28 px-4 sm:px-6 border-t border-[#141724]">
            <div className="max-w-4xl mx-auto">
                {/* Section Question & Heading */}
                <div className="text-center mb-14">
                    <span className="text-xs font-semibold text-red-500 tracking-wider uppercase">
                        Can I trust it?
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mt-2 mb-4">
                        Clinical safety in every drop.
                    </h2>
                    <p className="text-base sm:text-lg text-[#a6abbd] max-w-2xl mx-auto leading-relaxed">
                        Every hospital is accredited by medical authorities, and all blood undergoes mandatory laboratory screening before transfusion.
                    </p>
                </div>

                {/* 3 Safety Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-[#0d0f18] border border-[#1a1c28] rounded-2xl p-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-semibold text-white mb-2">Accredited Hospitals Only</h3>
                        <p className="text-sm text-[#8b91a7] leading-relaxed">
                            Only verified healthcare facilities and certified blood banks with verified MDCN credentials can initiate broadcasts.
                        </p>
                    </div>

                    <div className="bg-[#0d0f18] border border-[#1a1c28] rounded-2xl p-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                            <Stethoscope className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-semibold text-white mb-2">Mandatory Lab Screening</h3>
                        <p className="text-sm text-[#8b91a7] leading-relaxed">
                            Every donation goes through full clinical testing (HIV, Hepatitis B & C, Syphilis) by hospital lab scientists before patient use.
                        </p>
                    </div>

                    <div className="bg-[#0d0f18] border border-[#1a1c28] rounded-2xl p-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                            <Lock className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-semibold text-white mb-2">Protected Donor Privacy</h3>
                        <p className="text-sm text-[#8b91a7] leading-relaxed">
                            Donor contact information and medical status are encrypted and never made public, complying strictly with NDPR standards.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
