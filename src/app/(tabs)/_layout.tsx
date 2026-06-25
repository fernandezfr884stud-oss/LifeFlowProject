import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        animation: "none",
        lazy: false,
        sceneStyle: {
        backgroundColor: "#FFFFFF",
        },

            tabBarStyle: {
              position: "absolute",
              // automatic pero may limit
              bottom: Math.min(insets.bottom, 15) + 35,
              left: 15,
              right: 15,
              // fixed height ulit
              height: 80,
              borderRadius: 30,
              backgroundColor: "#FFFFFF",

              elevation: 5,
              shadowOpacity: 0.1,
              borderTopWidth: 0,
            },

            tabBarItemStyle: {
              flex: 1,
              justifyContent: "center",
              alignItems: "center",

              // dagdag vertical space
              paddingTop: 5,
            },

            tabBarLabelStyle: {
              fontSize: 11,

              // ilapit sa icon
              marginTop: -2,

              // important para di matago
              paddingBottom: 5,
            },

            tabBarIconStyle: {
              marginTop: 5,
            },

        tabBarActiveTintColor: "#730000",
        tabBarInactiveTintColor: "#999",
              }}
    >
<Tabs.Screen
  name="dashboard"
  options={{
    title: "Home",
    tabBarIcon: ({ color, size }) => (
      <Ionicons
        name="home-outline"
        size={size}
        color={color}
      />
    ),
  }}
/>

        <Tabs.Screen
          name="finddonor"
          options={{
            title: "Find",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="search-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="request"
          options={{
            title: "Request",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="person-add-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="message"
          options={{
            title: "Message",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="chatbubble-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="person-circle-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />
    </Tabs>
  );
}