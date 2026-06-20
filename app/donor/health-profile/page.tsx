"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  HeartPulse,
  Droplet,
  Ruler,
  Weight,
  Activity,
  Pill,
  AlertTriangle,
  CalendarClock,
  Save,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENOTYPES = ["AA", "AS", "SS", "AC", "SC"];

interface HealthInfo {
  height_cm: string;
  weight_kg: string;
  blood_pressure: string;
  resting_heart_rate: string;
  chronic_conditions: string;
  allergies: string;
  current_medications: string;
  recent_surgery_or_illness: string;
  is_pregnant_or_nursing: boolean;
  smokes_or_uses_tobacco: boolean;
  travel_history_malaria_zone: boolean;
  last_screening_date: string;
  last_screening_notes: string;
}

interface ProfileFormState {
  full_name: string;
  blood_group: string;
  genotype: string;
  last_donation_date: string;
  health: HealthInfo;
}

const EMPTY_HEALTH: HealthInfo = {
  height_cm: "",
  weight_kg: "",
  blood_pressure: "",
  resting_heart_rate: "",
  chronic_conditions: "",
  allergies: "",
  current_medications: "",
  recent_surgery_or_illness: "",
  is_pregnant_or_nursing: false,
  smokes_or_uses_tobacco: false,
  travel_history_malaria_zone: false,
  last_screening_date: "",
  last_screening_notes: "",
};

export default function HealthProfilePage() {
  const [form, setForm] = useState<ProfileFormState>({
    full_name: "",
    blood_group: "",
    genotype: "",
    last_donation_date: "",
    health: EMPTY_HEALTH,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("biomatch_profiles")
      .select("full_name, blood_group, genotype, last_donation_date, updated_health_info")
      .eq("id", userId)
      .single();

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    if (data) {
      const existingHealth = (data.updated_health_info ?? {}) as Partial<HealthInfo>;
      setForm({
        full_name: data.full_name ?? "",
        blood_group: data.blood_group ?? "",
        genotype: data.genotype ?? "",
        last_donation_date: data.last_donation_date ? data.last_donation_date.slice(0, 10) : "",
        health: { ...EMPTY_HEALTH, ...existingHealth },
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateHealth = <K extends keyof HealthInfo>(key: K, value: HealthInfo[K]) => {
    setForm((prev) => ({ ...prev, health: { ...prev.health, [key]: value } }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("biomatch_profiles")
      .update({
        full_name: form.full_name,
        blood_group: form.blood_group || null,
        genotype: form.genotype || null,
        last_donation_date: form.last_donation_date || null,
        updated_health_info: form.health,
      })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Health Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Keep this accurate — hospitals rely on it to confirm safe, eligible matches.
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identity & blood type */}
        <Section icon={Droplet} title="Identity & Blood Type">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <input
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Blood group">
              <select
                value={form.blood_group}
                onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
                className="input"
              >
                <option value="">Unknown / not tested</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Genotype">
              <select
                value={form.genotype}
                onChange={(e) => setForm({ ...form, genotype: e.target.value })}
                className="input"
              >
                <option value="">Unknown / not tested</option>
                {GENOTYPES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Last donation date">
              <input
                type="date"
                value={form.last_donation_date}
                onChange={(e) => setForm({ ...form, last_donation_date: e.target.value })}
                className="input"
              />
            </Field>
          </div>
        </Section>

        {/* Vitals */}
        <Section icon={Activity} title="Vitals">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Height (cm)" icon={Ruler}>
              <input
                type="number"
                min="0"
                value={form.health.height_cm}
                onChange={(e) => updateHealth("height_cm", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Weight (kg)" icon={Weight}>
              <input
                type="number"
                min="0"
                value={form.health.weight_kg}
                onChange={(e) => updateHealth("weight_kg", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Blood pressure (e.g. 120/80)">
              <input
                value={form.health.blood_pressure}
                onChange={(e) => updateHealth("blood_pressure", e.target.value)}
                className="input"
                placeholder="120/80"
              />
            </Field>
            <Field label="Resting heart rate (bpm)">
              <input
                type="number"
                min="0"
                value={form.health.resting_heart_rate}
                onChange={(e) => updateHealth("resting_heart_rate", e.target.value)}
                className="input"
              />
            </Field>
          </div>
        </Section>

        {/* Medical history */}
        <Section icon={Pill} title="Medical History">
          <div className="grid gap-4">
            <Field label="Chronic conditions">
              <textarea
                value={form.health.chronic_conditions}
                onChange={(e) => updateHealth("chronic_conditions", e.target.value)}
                className="input min-h-[72px]"
                placeholder="e.g. hypertension, diabetes — leave blank if none"
              />
            </Field>
            <Field label="Allergies">
              <textarea
                value={form.health.allergies}
                onChange={(e) => updateHealth("allergies", e.target.value)}
                className="input min-h-[72px]"
                placeholder="e.g. penicillin, latex — leave blank if none"
              />
            </Field>
            <Field label="Current medications">
              <textarea
                value={form.health.current_medications}
                onChange={(e) => updateHealth("current_medications", e.target.value)}
                className="input min-h-[72px]"
                placeholder="Leave blank if none"
              />
            </Field>
            <Field label="Recent surgery or major illness (last 6 months)">
              <textarea
                value={form.health.recent_surgery_or_illness}
                onChange={(e) => updateHealth("recent_surgery_or_illness", e.target.value)}
                className="input min-h-[72px]"
                placeholder="Leave blank if none"
              />
            </Field>
          </div>
        </Section>

        {/* Eligibility flags */}
        <Section icon={AlertTriangle} title="Eligibility Screening">
          <div className="space-y-3">
            <Checkbox
              label="Currently pregnant or nursing"
              checked={form.health.is_pregnant_or_nursing}
              onChange={(v) => updateHealth("is_pregnant_or_nursing", v)}
            />
            <Checkbox
              label="Smokes or uses tobacco products"
              checked={form.health.smokes_or_uses_tobacco}
              onChange={(v) => updateHealth("smokes_or_uses_tobacco", v)}
            />
            <Checkbox
              label="Traveled to a malaria-risk area in the last 12 months"
              checked={form.health.travel_history_malaria_zone}
              onChange={(v) => updateHealth("travel_history_malaria_zone", v)}
            />
          </div>
        </Section>

        {/* Last screening */}
        <Section icon={CalendarClock} title="Last Medical Screening">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Screening date">
              <input
                type="date"
                value={form.health.last_screening_date}
                onChange={(e) => updateHealth("last_screening_date", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Notes / results" className="sm:col-span-2">
              <textarea
                value={form.health.last_screening_notes}
                onChange={(e) => updateHealth("last_screening_notes", e.target.value)}
                className="input min-h-[72px]"
                placeholder="Any notes from your last checkup or blood screening"
              />
            </Field>
          </div>
        </Section>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Health Profile
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>
      </form>

      <style jsx global>{`
        .input {
          margin-top: 0.25rem;
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          border-color: #fb7185;
        }
      `}</style>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-2">
        <Icon className="h-4.5 w-4.5 text-rose-600" />
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  icon: Icon,
  className,
  children,
}: {
  label: string;
  icon?: React.ElementType;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </span>
      {children}
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-400"
      />
      {label}
    </label>
  );
}