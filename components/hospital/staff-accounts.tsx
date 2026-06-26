import { useState } from "react";
import { Users, Badge } from "lucide-react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";

interface StaffMember {
	name: string;
	role: string;
	status: string;
}

const ROLES = [
	"ER Lead Nurse",
	"Blood Bank Coordinator",
	"Emergency Surgeon",
	"ER Chief Officer",
];

export function StaffAccounts() {
	const [staffList, setStaffList] = useState<StaffMember[]>([
		{
			name: "Dr. Ngozi Alabi",
			role: "ER Chief Director",
			status: "Active",
		},
		{
			name: "Nurse Babajide Cole",
			role: "Blood Bank Co-ordinator",
			status: "Active",
		},
		{
			name: "Dr. Tunde Folawiyo",
			role: "On-Call Hematologist",
			status: "Active",
		},
	]);
	const [newStaffName, setNewStaffName] = useState("");
	const [newStaffRole, setNewStaffRole] = useState("ER Nurse");

	const handleAddStaff = (e: React.FormEvent) => {
		e.preventDefault();
		if (newStaffName) {
			setStaffList([
				...staffList,
				{ name: newStaffName, role: newStaffRole, status: "Active" },
			]);
			setNewStaffName("");
		}
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
			<Card className="bg-white border border-gray-100 rounded-3xl p-6 lg:col-span-2 text-left shadow-sm">
				<CardHeader className="p-0 pb-4 border-b border-gray-100 mb-6">
					<CardTitle className="text-base font-bold flex items-center gap-2">
						<Users className="h-5 w-5 text-red-600" />
						Authorized Staff Accounts
					</CardTitle>
					<CardDescription className="text-xs text-gray-500">
						Manage medical practitioners authorized to trigger
						emergency broadcasts under license
					</CardDescription>
				</CardHeader>

				<div className="space-y-4">
					{staffList.map((st, i) => (
						<div
							key={i}
							className="flex justify-between items-center p-3.5 bg-gray-50 border border-gray-100 rounded-2xl"
						>
							<div>
								<span className="font-bold text-sm text-gray-900 block">
									{st.name}
								</span>
								<span className="text-xs text-gray-400 mt-0.5 block">
									{st.role}
								</span>
							</div>
							<span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-[10px] font-mono font-semibold tracking-wider text-green-700">
								{st.status}
							</span>
						</div>
					))}
				</div>
			</Card>

			<Card className="bg-white border border-gray-100 rounded-3xl p-6 lg:col-span-1 text-left shadow-sm">
				<CardHeader className="p-0 pb-4 border-b border-gray-100 mb-6">
					<CardTitle className="text-base font-bold">
						Authorize Practitioner
					</CardTitle>
					<CardDescription className="text-xs text-gray-500">
						Grant dispatch permissions
					</CardDescription>
				</CardHeader>

				<form onSubmit={handleAddStaff} className="space-y-4">
					<div>
						<label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
							Doctor/Nurse Name
						</label>
						<input
							type="text"
							placeholder="Dr. Ayomide Oseni"
							value={newStaffName}
							onChange={(e) => setNewStaffName(e.target.value)}
							className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
							required
						/>
					</div>

					<div>
						<label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
							ER Console Role
						</label>
						<select
							value={newStaffRole}
							onChange={(e) => setNewStaffRole(e.target.value)}
							className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
						>
							{ROLES.map((r) => (
								<option key={r} value={r}>
									{r}
								</option>
							))}
						</select>
					</div>

					<button
						type="submit"
						className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-2xl transition shadow-sm"
					>
						Add Authorized Staff
					</button>
				</form>
			</Card>
		</div>
	);
}
