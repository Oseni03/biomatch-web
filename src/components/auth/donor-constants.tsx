export const DONOR_STEPS = [
    { num: 1, label: "Choose Role" },
    { num: 2, label: "Donor Details" },
    { num: 3, label: "Screening Pass" },
    { num: 4, label: "Alert Ready" },
] as const;

export const BLOOD_GROUP_UNKNOWN = "unknown";

export const BLOOD_GROUP_OPTIONS = [
    { value: BLOOD_GROUP_UNKNOWN, label: "I don't know (screen me for free)" },
    ...["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => ({
        value: group,
        label: group,
    })),
];

export const DEFAULT_HOSPITAL = "Lagos University Teaching Hospital (LUTH)";

export const SCREENING_HOSPITALS = [
    {
        value: "Lagos University Teaching Hospital (LUTH)",
        label: "Lagos University Teaching Hospital (LUTH, Idi-Araba)",
    },
    {
        value: "Lagos State University Teaching Hospital (LASUTH)",
        label: "Lagos State University Teaching Hospital (LASUTH, Ikeja)",
    },
    {
        value: "General Hospital Lagos Island",
        label: "General Hospital Lagos Island",
    },
    {
        value: "National Hospital Abuja",
        label: "National Hospital Abuja",
    },
    {
        value: "University College Hospital (UCH) Ibadan",
        label: "University College Hospital (UCH) Ibadan",
    },
    {
        value: "University of Port Harcourt Teaching Hospital (UPTH)",
        label: "University of Port Harcourt Teaching Hospital (UPTH)",
    },
];