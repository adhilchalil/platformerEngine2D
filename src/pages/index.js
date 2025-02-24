import Image from "next/image";
import { Inter } from "next/font/google";
import Gravityroom from "./gravityroom";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <Gravityroom/>
  );
}
