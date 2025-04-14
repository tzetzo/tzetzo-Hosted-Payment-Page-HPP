import Hero from "@/components/Hero";
import bg from "@/public/background.jpg";

export default function Home() {
  return (
    <Hero imgData={bg} imgAlt="cityscape" title="Welcome to the HostedPayin" />
  );
}
