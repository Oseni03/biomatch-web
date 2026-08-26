import { QueryClient } from "@tanstack/react-query";
import { cache } from "react";

// One QueryClient per server request (React's cache() resets per render pass),
// used to prefetch data in Server Components and hydrate it into client query hooks.
export const getQueryClient = cache(
	() =>
		new QueryClient({
			defaultOptions: {
				queries: {
					staleTime: 60 * 1000,
				},
			},
		}),
);
