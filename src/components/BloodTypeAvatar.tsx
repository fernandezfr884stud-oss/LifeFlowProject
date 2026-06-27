import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";

const RED = "#730000";

/*
  Reusable BloodTypeAvatar component.

  Purpose:
  - Shows profile image if available.
  - If no profile image, blood type will be shown as temporary avatar.
  - Useful for Find Donor, Profile, and Request screens.
*/
type BloodTypeAvatarProps = {
  bloodType: string;
  image?: ImageSourcePropType;
  size?: number;
  fontSize?: number;
};

export default function BloodTypeAvatar({
  bloodType,
  image,
  size = 58,
  fontSize = 17,
}: BloodTypeAvatarProps) {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {image ? (
        <Image source={image} style={styles.avatarImage} />
      ) : (
        <Text style={[styles.avatarText, { fontSize }]}>{bloodType}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: RED,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
});