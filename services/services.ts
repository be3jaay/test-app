import ApiService from "./api-services";

const BASE_API_URL = "https://code-camp-hackathon-be.onrender.com/api";
export type OnboardingTypeData = {
  name: string;
  phone: string;
  skills: string[];
  location: string;
  serviceDescription: string;
};
async function postOnboarding(data: OnboardingTypeData) {
  try {
    await ApiService.post(`${BASE_API_URL}/auth/onboarding`, {
      name: data.name,
      phone: data.phone,
      skills: data.skills,
      location: data.location,
      serviceDescription: data.serviceDescription,
    });
  } catch (error) {
    console.error(error);
  }
}

export default { postOnboarding };
