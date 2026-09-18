import React from 'react';
import { Heart, Activity, ShieldAlert } from 'lucide-react';

export const BloodShortage: React.FC = () => {
    return (
        <section id="why-it-matters" className="py-20 md:py-28 px-4 sm:px-6 border-t border-[#141724]">
            <div className="max-w-4xl mx-auto">
                {/* Section Question & Heading */}
                <div className="text-center mb-14">
                    <span className="text-xs font-semibold text-red-500 tracking-wider uppercase">
                        Why does this matter?
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mt-2 mb-4">
                        Every minute without blood costs a life.
                    </h2>
                    <p className="text-base sm:text-lg text-[#a6abbd] max-w-2xl mx-auto leading-relaxed">
                        When childbirth complications or road trauma strike, patients cannot afford to wait hours for distant blood banks to respond.
                    </p>
                </div>

                {/* 3 Focused Visual Impact Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-[#0d0f18]/80 border border-[#1a1c28] rounded-2xl p-6 flex flex-col justify-between hover:border-red-900/40 transition-colors">
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
                                <Heart className="w-5 h-5 fill-red-500/20" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Maternal Emergencies</h3>
                            <p className="text-sm text-[#8b91a7] leading-relaxed">
                                Postpartum hemorrhage is the leading cause of maternal death in Nigeria. Immediate transfusion saves mothers and newborns.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-[#1a1c28] text-xs font-mono text-red-400">
                            #1 Maternal risk factor
                        </div>
                    </div>

                    <div className="bg-[#0d0f18]/80 border border-[#1a1c28] rounded-2xl p-6 flex flex-col justify-between hover:border-red-900/40 transition-colors">
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
                                <Activity className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Emergency Trauma</h3>
                            <p className="text-sm text-[#8b91a7] leading-relaxed">
                                Accidents require prompt replacement of lost blood. Having pre-screened donors nearby prevents irreversible shock.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-[#1a1c28] text-xs font-mono text-red-400">
                            Minutes define survival
                        </div>
                    </div>

                    <div className="bg-[#0d0f18]/80 border border-[#1a1c28] rounded-2xl p-6 flex flex-col justify-between hover:border-red-900/40 transition-colors">
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Pediatric Care</h3>
                            <p className="text-sm text-[#8b91a7] leading-relaxed">
                                Children battling severe malaria anemia and sickle cell crises depend on reliable, screened blood units.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-[#1a1c28] text-xs font-mono text-red-400">
                            Lifelines for children
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
