import {  Text } from "react-native";
import Avatar from "../../components/Avatar";


export default function Home() {
    const img = require("../../assets/Avatar-profile.png");



    return (
        <>
            <Avatar
                name="John Doe"
                imageUrl={img}
            />
            <Text>Welcome to the home page</Text>
        </>
    );
}   