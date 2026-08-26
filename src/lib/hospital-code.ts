export function formatHospitalCode(sequenceNumber: number) {
  return `BIOMATCH-${String(sequenceNumber).padStart(3, "0")}`;
}
