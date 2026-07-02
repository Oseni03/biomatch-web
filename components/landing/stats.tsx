import { StatBlock } from "@/components/prospeo/stat-block";
import { Heart, Building, Clock, Users } from "lucide-react";

const STATS = [
	{ value: "14,210", label: "Lives Saved", icon: <Heart className="h-5 w-5" /> },
	{ value: "3,847", label: "Verified Donors", icon: <Users className="h-5 w-5" /> },
	{ value: "92", label: "Partner Hospitals", icon: <Building className="h-5 w-5" /> },
	{ value: "8.7s", label: "Avg Response", icon: <Clock className="h-5 w-5" /> },
];

export function Stats() {
	return (
		<div className="max-w-5xl mx-auto px-4 pb-20">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{STATS.map((stat, i) => (
					<StatBlock key={i} value={stat.value} label={stat.label} icon={stat.icon} />
				))}
			</div>
		</div>
	);
}
