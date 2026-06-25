import { useRouter } from "expo-router";
import OnboardingTemplate from "../components/OnboardingTemplate";

export default function Onboarding2() {
  const router = useRouter();

  return (
    <OnboardingTemplate
      image={require("../../assets/images/OnBoardPic2.png")}
      title="Save Lives Through Donation"
      description="Connect with blood donors and patients in real time. Every donation can help save a life."
      buttonText="LET'S START"
      isFirstScreen={false}
      onPress={() => router.replace("/welcome")}
    />
  );
}