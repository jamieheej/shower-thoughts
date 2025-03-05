import { Redirect } from "expo-router";
import { useUser } from "./(context)/UserContext";

export default function Index() {
  const { userInfo } = useUser();
  
  if (userInfo) {
    return <Redirect href="/(tabs)/Thoughts" />;
  } else {
    return <Redirect href="/Home" />;
  }
}