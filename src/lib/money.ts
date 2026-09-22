const HUNDRED = BigInt(100);
const ZERO = BigInt(0);

export function formatKoboToNaira(amountKobo: number | bigint): string {
	const value = typeof amountKobo === "bigint" ? amountKobo : BigInt(Math.trunc(amountKobo));
	const sign = value < ZERO ? "-" : "";
	const abs = value < ZERO ? -value : value;
	const naira = abs / HUNDRED;
	const kobo = abs % HUNDRED;
	const grouped = naira.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return `${sign}₦${grouped}.${kobo.toString().padStart(2, "0")}`;
}
