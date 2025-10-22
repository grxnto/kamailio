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

export default function Home() {
  return (
    <div className="font-mono flex flex-col items-center justify-center min-h-screen px-8 sm:px-8 min-w-[350px]">
      <main className="justify-center">
        <a className="block text-center hover:underline hover:underline-offset-4 text-6xl font-bold text-white" href="https://github.com/grxnto/kamailio" target="_blank" rel="noopener noreferrer">
          Kamaʻilio
        </a> 
        <h1 className="flex text-3xl font-bold text-white justify-center">
          Audio Transcriber
        </h1>         
        <AudioRecorder />
      </main>
    </div>
  );
}
