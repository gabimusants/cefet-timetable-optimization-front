import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Image src="/images/cefet.jpg" alt="CEFET" fill quality={100} />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 to-blue-950/60"></div>
      <div className="container relative z-10 mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-4xl md:text-5xl 2xl:text-5xl font-bold text-white mb-6">
            Planejamento de Horários
          </h1>
          <p className="text-xl text-gray-100 mb-8">
            Engenharia de Computação - CEFET/RJ Petrópolis
          </p>
          <div className="space-y-4">
            <Link href="/upload">
              <Button className="bg-blue-700 hover:bg-blue-800 text-lg px-8 py-6 shadow-lg">
                <Upload className="mr-2 h-5 w-5" /> Upload JSON
              </Button>
            </Link>
          </div>
        </div>
    </main>
  );
}
