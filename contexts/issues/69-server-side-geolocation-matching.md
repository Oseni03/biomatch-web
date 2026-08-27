# 69: Server-Side Geolocation Matching

**What to build:** BioMatch geocodes donor and hospital addresses on the server using environment-configured provider settings and uses private coordinates for distance-based matching. Users see only broad location and approximate distance.

**Blocked by:** 68: Donor Profile Completion

**Status:** ready-for-agent

- [x] Registration and address changes attempt server-side geocoding with no browser-exposed provider secret.
- [x] Coordinates are stored privately and used for approximate distance calculations and 10 km radius tiers up to 50 km.
- [x] Geocoding failures do not appear in the user interface, are structured-loggable, and do not prevent saving the address.
- [x] A failed address update does not overwrite the last known valid coordinates.
