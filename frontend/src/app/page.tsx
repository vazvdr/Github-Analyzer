import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";

export default function Home() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute left-1/2 top-[-300px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-[-250px] left-[-200px] h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute right-[-200px] top-[40%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
            </div>
            <Header />
            <Hero />
            <HowItWorks />
            <Features />
            <Footer />
        </main>
    );
}