import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";
import { signIn } from "@/auth";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      <Navbar />
      <Hero />
      <Features />

      <Footer />
    </main>
  );
}

