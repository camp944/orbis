import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Orbis",
  description: "Gerenciador de Escalas e Sorteios",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} flex h-screen bg-gray-50 overflow-hidden text-gray-800`}>
        
        {/* O Sidebar gerencia sozinho o modo Desktop/Mobile */}
        <Sidebar />
        
        {/* Container Principal */}
        <main className="flex-1 h-screen overflow-y-auto w-full relative">
          {/* Padding Top dinâmico: Dá espaço para o botão do menu apenas no mobile */}
          <div className="md:pt-0 pt-16 h-full w-full">
            {children}
          </div>
        </main>
        
      </body>
   </html>
  );
}