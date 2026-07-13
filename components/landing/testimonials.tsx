"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Dr. Adebayo O.",
    role: "Hospital Administrator, Lagos University Teaching Hospital",
    quote:
      "BioMatch has transformed how we source blood for emergency cases. What used to take hours now happens in minutes. The verified donor network is a game-changer for Nigerian healthcare.",
    initials: "AO",
  },
  {
    name: "Chioma E.",
    role: "Regular Blood Donor",
    quote:
      "I&apos;ve been donating blood for years, but BioMatch made it so much easier. I get alerts when my blood type is needed nearby, and I can see exactly how many lives I&apos;ve helped save.",
    initials: "CE",
  },
  {
    name: "Mr. Ibrahim D.",
    role: "Patient Family Member",
    quote:
      "When my daughter needed an emergency blood transfusion, BioMatch found a compatible donor within 15 minutes. I am forever grateful to everyone on this platform.",
    initials: "ID",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function Testimonials() {
  return (
    <section id="testimonials" className="border-t border-border bg-background px-4 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand">
            Testimonials
          </p>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Hear from our community
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-3"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              variants={cardVariants}
              className="relative flex flex-col gap-5 rounded-2xl border border-border bg-card p-7 shadow-card"
            >
              <Quote className="h-8 w-8 text-brand/20" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-auto flex items-center gap-3 pt-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {t.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
