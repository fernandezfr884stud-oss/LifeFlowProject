import { useRouter } from "expo-router";
import OnboardingTemplate from "../components/OnboardingTemplate";

export default function Onboarding1() {
  const router = useRouter();

  return (
    <OnboardingTemplate
      /*
        This screen uses the reusable OnboardingTemplate component.
        It keeps onboarding screens consistent and cleaner.
      */
      image={require("../../assets/images/OnBoardPic1.png")}
      title="Welcome to LifeFlow"
      description="Find blood donors quickly and connect with people who need your help."
      buttonText="CONTINUE"
      isFirstScreen={true}
      onPress={() => router.push("/onboarding2")}
    />
  );
}