"use client";

import { useEffect, useRef } from "react";
import { updateLastKnownLocation } from "@/servers/user";

export function useLastKnownLocation(userId: string | undefined) {
	const attempted = useRef(false);

	useEffect(() => {
		if (!userId || attempted.current) return;
		if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
			return;
		}
		attempted.current = true;

		const push = (latitude: number, longitude: number) => {
			updateLastKnownLocation(userId, { latitude, longitude }).catch(
				() => {},
			);
		};

		const requestPosition = () => {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					push(position.coords.latitude, position.coords.longitude);
				},
				() => {},
				{ maximumAge: 1000 * 60 * 10, timeout: 10000 },
			);
		};

		const permissions = (
			navigator as Navigator & {
				permissions?: { query: (q: { name: string }) => Promise<{ state: string }> };
			}
		).permissions;
		if (permissions?.query) {
			permissions
				.query({ name: "geolocation" })
				.then((status) => {
					if (status.state === "granted") {
						requestPosition();
					}
				})
				.catch(() => {});
		}
	}, [userId]);
}
