"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, Droplet, Users, RefreshCw } from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
const CRITICAL_THRESHOLD = 5;
const ELIGIBILITY_DAYS = 56;

interface HospitalBank {
  id: string;
  hospital_name: string;
  location: string;
  inventory: Record<string, number>;
  updated_at: string;
}

interface EligibleDonor {
  id: string;
  full_name: string;
  blood_group: string | null;
  last_donation_date: string | null;
}

export default function HospitalInventoryPage() {
  const [banks, setBanks] = useState<HospitalBank[]>([]);
  const [donors, setDonors] = useState<EligibleDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const fetchBanks = useCallback(async () => {
    const { data, error } = await supabase
      .from("biomatch_hospital_banks")
      .select("id, hospital_name, location, inventory, updated_at")
      .order("hospital_name");
    if (!error && data) setBanks(data as HospitalBank[]);
    setLastSync(new Date());
  }, []);

  const fetchEligibleDonors = useCallback(async () => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - ELIGIBILITY_DAYS);

    const { data, error } = await supabase
      .from("biomatch_profiles")
      .select("id, full_name, blood_group, last_donation_date")
      .eq("role", "donor")
      .or(`last_donation_date.is.null,last_donation_date.lt.${cutoff.toISOString()}`)
      .limit(20);

    if (!error && data) setDonors(data as EligibleDonor[]);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchBanks(), fetchEligibleDonors()]).finally(() => setLoading(false));

    const channel = supabase
      .channel("biomatch_inventory_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "biomatch_hospital_banks" },
        () => fetchBanks()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBanks, fetchEligibleDonors]);

  const aggregateInventory = (group: string) =>
    banks.reduce((sum, bank) => sum + (bank.inventory?.[group] ?? 0), 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Inventory Grid</h1>
          <p className="text-sm text-gray-500">Real-time blood stock across all BioMatch partner banks</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <RefreshCw className="h-3.5 w-3.5" />
          {lastSync ? `Synced ${lastSync.toLocaleTimeString()}` : "Syncing..."}
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {BLOOD_GROUPS.map((g) => (
            <div key={g} className="h-32 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {BLOOD_GROUPS.map((group) => {
            const units = aggregateInventory(group);
            const critical = units < CRITICAL_THRESHOLD;
            return (
              <div
                key={group}
                className={`relative overflow-hidden rounded-xl border p-4 transition-shadow ${
                  critical
                    ? "border-red-300 bg-red-50 shadow-[0_0_0_1px_rgba(248,113,113,0.4)] animate-pulse"
                    : "border-gray-200 bg-white"
                }`}
              >
                {critical && (
                  <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                    <AlertTriangle className="h-3 w-3" />
                    Critical
                  </span>
                )}
                <div className="flex items-center gap-2 text-gray-400">
                  <Droplet className={`h-4 w-4 ${critical ? "text-red-500" : "text-rose-400"}`} fill="currentColor" />
                  <span className="text-sm font-medium">{group}</span>
                </div>
                <p className={`mt-3 text-3xl font-bold ${critical ? "text-red-600" : "text-gray-900"}`}>
                  {units}
                </p>
                <p className="text-xs text-gray-400">units available</p>
              </div>
            );
          })}
        </div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center gap-2 border-b px-5 py-4">
          <Users className="h-4.5 w-4.5 text-rose-600" />
          <h2 className="text-sm font-semibold text-gray-900">Eligible BioMatch Donors</h2>
          <span className="ml-auto text-xs text-gray-400">
            Last donation 56+ days ago or never donated
          </span>
        </div>
        <div className="divide-y">
          {donors.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400">No eligible donors found right now.</p>
          ) : (
            donors.map((donor) => (
              <div key={donor.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{donor.full_name}</p>
                  <p className="text-xs text-gray-400">
                    {donor.last_donation_date
                      ? `Last donated ${new Date(donor.last_donation_date).toLocaleDateString()}`
                      : "No prior donation on record"}
                  </p>
                </div>
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                  {donor.blood_group ?? "Unknown"}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
