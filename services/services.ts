import ApiService from "./api-services";

export type OnboardingTypeData = {
  name: string;
  phone: string;
  skills: string[];
  location: string;
  serviceDescription: string;
};

async function postOnboarding(data: OnboardingTypeData) {
  await ApiService.post("/auth/onboarding", {
    name: data.name,
    phone: data.phone,
    skills: data.skills,
    location: data.location,
    serviceDescription: data.serviceDescription,
  });
}

export default { postOnboarding };
