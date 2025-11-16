import { HeroHeader } from "@/app/(marketing)/_components/header";
import HeroSection from "@/app/(marketing)/_components/hero-section";
import { ToggleTheme } from "@/components/ui/Theme-toggler";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <HeroHeader />
      <HeroSection />
    </div>
  );
}
