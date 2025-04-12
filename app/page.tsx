import Hero from "@/components/Hero";
const bg = "/background.jpg";

export default function Home() {
  return (
    <Hero imgData={bg} imgAlt="cityscape" title="Welcome to the City Builder" />
  );
}
