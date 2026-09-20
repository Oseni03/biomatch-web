export default function HospitalNotificationsLoading() {
	return (
		<div className="space-y-8 animate-pulse">
			<div className="h-24 rounded-2xl bg-muted" />
			<div className="space-y-3">
				{[0, 1, 2].map((i) => (
					<div key={i} className="h-20 rounded-2xl bg-muted" />
				))}
			</div>
		</div>
	);
}
