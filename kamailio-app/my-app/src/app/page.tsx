import Image from "next/image";

{/*"font-mono list-inside list-decimal text-sm/6 text-center sm:text-left" 
  "bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded"
  "rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
  "rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
  */}
{/*className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"*/}

import AudioRecorder from "./components/audio-recorder";
import AnimatedText from "./components/animated-text";

export default function Home() {
  return (
    <div className="font-mono flex flex-col items-center justify-center min-h-screen min-w-[300px]">
        {/* Header */}
      <header className="w-full pt-6 flex justify-between items-center px-8">
        <a className="hover:underline hover:underline-offset-4 flex pb-2 text-xl font-bold text-white justify-center" href="https://github.com/grxnto/kamailio" target="_blank" rel="noopener noreferrer"> Kamaʻilio</a> 
        <nav className="flex gap-6 text-sm">
          <a href="#about" className="hover:underline hover:underline-offset-4">Record</a>
          <a href="#features" className="hover:underline hover:underline-offset-4">Upload</a>
          <a href="#contact" className="hover:underline hover:underline-offset-4">About</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex justify-center min-w-screen min-h-[500]">
        <div className="absolute animate-spin-slow">
          <AnimatedText animationSpeed={30}/>
        </div>
        
        {/* Center image */}
        <div className="relative z-10 mt-25">
          <Image
            src="/ilio.png" 
            alt="ʻīlio"
            width={180}          
            height={180}
            className="rounded-full object-cover"
          />
        </div>
      </section>



        {/* App Section */}
      <main className="justify-center">
        <h1 className="flex text-3xl font-bold text-white justify-center">
          Audio Transcriber
        </h1>         
        <AudioRecorder />
      </main>
    </div>
  );
}
