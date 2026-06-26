import { useState } from "react";
import { Users, Search, Phone } from "lucide-react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";

interface DonorEntry {
	name: string;
	email: string;
	phone: string;
	bloodType: string;
	location: string;
	status: "available" | "busy";
}

const REGISTERED_DONORS: DonorEntry[] = [
	{
		name: "Chinedu Okafor",
		email: "chinedu@biomatch.org",
		phone: "08034567891",
		bloodType: "O+",
		location: "Ikeja, Lagos",
		status: "available",
	},
	{
		name: "David Adebayo",
		email: "donor@biomatch.org",
		phone: "08012345678",
		bloodType: "O+",
		location: "Ikeja, Lagos",
		status: "available",
	},
	{
		name: "Fatima Bello",
		email: "fatima@biomatch.org",
		phone: "08055667788",
		bloodType: "A+",
		location: "Lekki, Lagos",
		status: "available",
	},
	{
		name: "Emeka Obi",
		email: "emeka@biomatch.org",
		phone: "08123456789",
		bloodType: "O+",
		location: "Ikeja, Lagos",
		status: "available",
	},
	{
		name: "Funmi Adebayo",
		email: "funmi@biomatch.org",
		phone: "08198765432",
		bloodType: "B+",
		location: "Surulere, Lagos",
		status: "busy",
	},
	{
		name: "Tunde Ednut",
		email: "tunde@biomatch.org",
		phone: "08022334455",
		bloodType: "O-",
		location: "Victoria Island, Lagos",
		status: "available",
	},
	{
		name: "Sarah Alabi",
		email: "sarah@biomatch.org",
		phone: "08077665544",
		bloodType: "B-",
		location: "Yaba, Lagos",
		status: "available",
	},
	{
		name: "Ibrahim Lawal",
		email: "ibrahim@biomatch.org",
		phone: "08099887766",
		bloodType: "AB+",
		location: "Yaba, Lagos",
		status: "available",
	},
	{
		name: "Chioma Nze",
		email: "chioma@biomatch.org",
		phone: "08122334455",
		bloodType: "O-",
		location: "Lekki, Lagos",
		status: "available",
	},
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const LOCATIONS = ["Ikeja", "Lekki", "Surulere", "Yaba", "Victoria Island"];

export function DonorDirectory() {
	const [searchBlood, setSearchBlood] = useState("All");
	const [searchLoc, setSearchLoc] = useState("All");
	const [searchQuery, setSearchQuery] = useState("");

	const filteredDonors = REGISTERED_DONORS.filter((d) => {
		const bloodMatches =
			searchBlood === "All" || d.bloodType === searchBlood;
		const locMatches =
			searchLoc === "All" ||
			d.location.toLowerCase().includes(searchLoc.toLowerCase());
		const queryMatches =
			!searchQuery ||
			d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			d.phone.includes(searchQuery);
		return bloodMatches && locMatches && queryMatches;
	});

	return (
		<Card className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm animate-in fade-in duration-300 text-left">
			<CardHeader className="p-0 pb-4 border-b border-gray-100 mb-6">
				<CardTitle className="text-lg font-bold flex items-center gap-2">
					<Users className="h-5 w-5 text-red-600" />
					Proactive Volunteer Registry Search
				</CardTitle>
				<CardDescription className="text-xs text-gray-500">
					Query, filter, and proactively contact matching nearby
					voluntary donors before or during emergencies
				</CardDescription>
			</CardHeader>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
				<div className="relative md:col-span-2">
					<span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
						<Search className="h-4 w-4" />
					</span>
					<input
						type="text"
						placeholder="Search by name or phone..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
					/>
				</div>

				<div>
					<select
						value={searchBlood}
						onChange={(e) => setSearchBlood(e.target.value)}
						className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
					>
						<option value="All">All Blood Types</option>
						{BLOOD_GROUPS.map((v) => (
							<option key={v} value={v}>
								Group {v}
							</option>
						))}
					</select>
				</div>

				<div>
					<select
						value={searchLoc}
						onChange={(e) => setSearchLoc(e.target.value)}
						className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
					>
						<option value="All">All Regions (Lagos)</option>
						{LOCATIONS.map((v) => (
							<option key={v} value={v}>
								{v}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-xs text-left">
					<thead>
						<tr className="border-b border-gray-150 text-gray-400 uppercase font-mono tracking-wider">
							<th className="py-3 px-3">Donor Name</th>
							<th className="py-3 px-3">Blood Type</th>
							<th className="py-3 px-3">Region</th>
							<th className="py-3 px-3">Availability</th>
							<th className="py-3 px-3 text-right">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{filteredDonors.length === 0 ? (
							<tr>
								<td
									colSpan={5}
									className="py-10 text-center text-gray-400 text-sm"
								>
									No matching registered donors found. Adjust
									filters to broaden your query scope.
								</td>
							</tr>
						) : (
							filteredDonors.map((donor, idx) => (
								<tr
									key={idx}
									className="hover:bg-gray-50 transition"
								>
									<td className="py-4 px-3">
										<span className="font-semibold text-gray-900 block">
											{donor.name}
										</span>
										<span className="text-[10px] text-gray-400 font-mono">
											{donor.email}
										</span>
									</td>
									<td className="py-4 px-3">
										<span className="px-2.5 py-0.5 bg-red-50 text-red-700 font-mono font-bold rounded-md">
											{donor.bloodType}
										</span>
									</td>
									<td className="py-4 px-3 font-medium text-gray-600">
										{donor.location}
									</td>
									<td className="py-4 px-3">
										<span
											className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold ${
												donor.status === "available"
													? "text-green-600"
													: "text-yellow-600"
											}`}
										>
											<span
												className={`w-1.5 h-1.5 rounded-full ${
													donor.status === "available"
														? "bg-green-500"
														: "bg-yellow-500"
												}`}
											/>
											{donor.status}
										</span>
									</td>
									<td className="py-4 px-3 text-right">
										<a
											href={`tel:${donor.phone}`}
											className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-[11px] inline-flex items-center gap-1 shadow-sm transition"
										>
											<Phone className="h-3 w-3" />
											Alert: {donor.phone}
										</a>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</Card>
	);
}
