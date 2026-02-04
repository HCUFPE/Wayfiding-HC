import { useEffect, useRef, useState } from "react";
import { BigOptionButton } from "./components/BigOptionButton";
import { MdLocationOn, MdArrowBack, MdSearch, MdBackspace } from "react-icons/md";
import { IdentificationIcon, MapIcon } from "@heroicons/react/24/solid";
import { NavigationPage } from "./pages/NavigationPage";
import { EditorPage } from "./pages/EditorPage";

/* ================= Splash ================= */
type SplashScreenProps = {
  onStart: () => void;
};

function SplashScreen({ onStart }: SplashScreenProps) {
  const startedRef = useRef(false);

  useEffect(() => {
    const handleStart = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      onStart();
    };

    window.addEventListener("keydown", handleStart);
    window.addEventListener("mousedown", handleStart);
    window.addEventListener("touchstart", handleStart);

    return () => {
      window.removeEventListener("keydown", handleStart);
      window.removeEventListener("mousedown", handleStart);
      window.removeEventListener("touchstart", handleStart);
    };
  }, [onStart]);

  return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-6">
        
        {/* Logo */}
        <img
          src="/apenas-logo.png"
          alt="Hospital das Clínicas"
          className="h-48 mb-6"
        />

        {/* Texto principal */}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
          Bem-vindo ao
        </h1>

        <h2 className="text-3xl md:text-4xl font-semibold text-slate-700">
          Hospital das Clínicas
        </h2>

        <h2 className="text-2xl md:text-3xl font-medium text-slate-600 mt-2">
          UFPE
        </h2>

        {/* Ícone de toque */}
        <div className="flex flex-col items-center animate-pulse mt-10">
          <p className="text-xl text-slate-600">
            Toque na tela para começar
          </p>

          <img
            src="/click.png"
            className="h-20 mb-4"
          />
        </div>
      </div>
    );
}

/* ================= Main ================= */
type MainScreenProps = {
  onTimeout: () => void;
  onFind: () => void;
  onProntuario: () => void;
};


function MainScreen({ onTimeout, onFind, onProntuario }: MainScreenProps)  {
  const idleTimerRef = useRef<number | null>(null);
  
  useEffect(() => {
    const resetTimer = () => {
      if (idleTimerRef.current !== null) {
        clearTimeout(idleTimerRef.current);
      }

      idleTimerRef.current = window.setTimeout(() => {
        onTimeout();
      }, 10000);
    };


    resetTimer();

    window.addEventListener("mousedown", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("touchstart", resetTimer);

    return () => {
      const timerId = idleTimerRef.current;

      if (timerId !== null) {
        clearTimeout(timerId);
      }
        window.removeEventListener("mousedown", resetTimer);
        window.removeEventListener("keydown", resetTimer);
        window.removeEventListener("touchstart", resetTimer);
      };
  }, [onTimeout]);

  return (
    <div className="h-screen bg-slate-100 flex flex-col">
      <header className="relative h-20 bg-white shadow flex items-center px-8">
        <img src="/logo-hc.png" className="h-48 w-auto object-contain" />

        <h1 className="absolute left-1/2 -translate-x-1/2 text-3xl font-bold">
          Encontre seu caminho
        </h1>
      </header>

      <main className="flex-1 flex items-center justify-center px-12">
        <div className="grid grid-cols-2 gap-12 w-full max-w-6xl">
          <BigOptionButton
            icon={<IdentificationIcon className="w-24 h-24" />}
            title="Tenho meu número"
            subtitle="Prontuário"
            color="bg-blue-600"
            onClick={onProntuario}
            
          />

          <BigOptionButton
            icon={<MapIcon className="w-24 h-24" />}
            title="Quero encontrar"
            subtitle="Exames, consultas, setores"
            color="bg-green-600"
            onClick={onFind}
          />
        </div>
      </main>
    </div>
  );
}

/* ================= App ================= */

export default function App() {
  const [screen, setScreen] = useState("splash");

  // Detecta se está na rota /editor
  useEffect(() => {
    if (window.location.pathname === '/editor') {
      setScreen('editor');
    }
  }, []);

  if (screen === "splash") {
    return <SplashScreen onStart={() => setScreen("menu")} />;
  }

  if (screen === "editor") {
    return <EditorPage />;
  }

  if (screen === "navigation") {
    return <NavigationPage onBack={() => setScreen("menu")} />;
  }

  return (
    <MainScreen
      onTimeout={() => setScreen("splash")}
      onFind={() => setScreen("navigation")}
      onProntuario={() => setScreen("navigation")}
    />
  );
}