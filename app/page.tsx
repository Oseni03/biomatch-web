import Link from "next/link";
import { Droplet, Building2, Wallet } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 to-rose-500">
        <Droplet className="h-7 w-7 text-white" fill="white" />
      </div>
      <h1 className="mt-6 text-3xl font-bold text-gray-900">BioMatch</h1>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        Connecting donors and hospitals through real-time blood inventory matching
        and non-cash wellness rewards.
      </p>

      <div className="mt-8 flex gap-3">
        <Link
          href="/auth/login"
          className="rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700"
        >
          Log in
        </Link>
        <Link
          href="/auth/signup"
          className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Create account
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left">
          <Building2 className="h-5 w-5 text-rose-600" />
          <p className="text-sm text-gray-600">Hospitals track live inventory across blood types</p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left">
          <Wallet className="h-5 w-5 text-rose-600" />
          <p className="text-sm text-gray-600">Donors earn points redeemable for HMO and gym perks</p>
        </div>
      </div>
    </main>
  );
}
