"use server";

type HospitalSidebarContext = {
	hospitalName: string;
	hospitalLocation: string;
	bloodBankStatus: "operational" | "limited" | "offline";
	bloodBankMessage: string;
};

export async function getHospitalSidebarContext(
	_organizationId: string,
): Promise<HospitalSidebarContext> {
	return {
		hospitalName: "",
		hospitalLocation: "",
		bloodBankStatus: "offline",
		bloodBankMessage: "Hospital setup arrives in slice 08",
	};
}

export async function createHospitalBank(_data: {
	hospitalName: string;
	location: string;
	organizationId?: string;
}): Promise<never> {
	throw new Error("Hospital setup arrives in slice 08");
}
