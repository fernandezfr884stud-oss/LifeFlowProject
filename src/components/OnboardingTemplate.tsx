import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";

/*
  This component is reusable.
  It is used by onboarding1 and onboarding2 para same layout/design sila.
*/
type Props = {
  image: ImageSourcePropType;
  title: string;
  description: string;
  buttonText: string;
  isFirstScreen?: boolean;
  onPress: () => void;
};

export default function OnboardingTemplate({
  image,
  title,
  description,
  buttonText,
  isFirstScreen = true,
  onPress,
}: Props) {
  return (
    <View style={styles.container}>
      {/* Top image section */}
      <View style={styles.imageContainer}>
        <Image
          source={image}
          style={styles.image}
          resizeMode="contain"
          /*
            This helps reduce image fade/flash on Android.
          */
          fadeDuration={0}
        />
      </View>

      {/* Page indicator */}
      <View style={styles.indicatorContainer}>
        <View style={isFirstScreen ? styles.activeDot : styles.dot} />
        <View style={isFirstScreen ? styles.dot : styles.activeDot} />
      </View>

      {/* Text content */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {/* Main button */}
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={onPress}
      >
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const RED = "#730000";

const styles = StyleSheet.create({
  /*
    Main screen.
  */
  container: {
    flex: 1,
    backgroundColor: RED,
  },

  /*
    Top white/gray image area.
  */
  imageContainer: {
    width: "100%",
    height: "52%",
    backgroundColor: "#F2F2F2",
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 42,
    justifyContent: "center",
    alignItems: "center",
  },

  /*
    Onboarding image.
  */
  image: {
    width: 260,
    height: 260,
  },

  /*
    Dots below image.
  */
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 32,
  },

  activeDot: {
    width: 38,
    height: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 5,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 20,
    backgroundColor: "#D9D9D9",
    marginHorizontal: 5,
  },

  /*
    Title and description wrapper.
  */
  textContainer: {
    paddingHorizontal: 28,
    alignItems: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
  },

  description: {
    color: "#F8DADA",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 25,
    marginBottom: 42,
  },

  /*
    Button.
  */
  button: {
    width: "85%",
    height: 62,
    backgroundColor: "#FFFFFF",
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },

  buttonText: {
    color: "#2B0000",
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 1,
  },
});