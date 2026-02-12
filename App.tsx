
import React, { useState, useRef, useEffect } from 'react';
import { ProcessingStep, ProcessingState } from './types';
import * as geminiService from './services/geminiService';
import AudioVisualizer from './components/AudioVisualizer';

const App: React.FC = () => {
  const [inputType, setInputType] = useState<'FILE' | 'URL'>('FILE');
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [visualPrompt, setVisualPrompt] = useState<string>("");
  const [sources, setSources] = useState<any[]>([]);
  const [status, setStatus] = useState<ProcessingState>({
    step: ProcessingStep.IDLE,
    progress: 0,
    message: 'READY_TO_START'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); };
  }, [audioUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('audio/')) {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setFile(selectedFile);
      setAudioUrl(URL.createObjectURL(selectedFile));
      setResultImage(null);
      setVisualPrompt("");
      setSources([]);
      setStatus({ step: ProcessingStep.IDLE, progress: 0, message: `FILE_LOADED: ${selectedFile.name.toUpperCase()}` });
    }
  };

  const startAnalysis = async () => {
    try {
      setStatus({ step: ProcessingStep.ANALYZING, progress: 30, message: 'EXTRACTING_SONIC_DNA' });
      let result;
      
      if (inputType === 'FILE' && file) {
        const base64Audio = await geminiService.fileToBase64(file);
        const promptText = await geminiService.analyzeAudioToPrompt(base64Audio, file.type);
        result = { text: promptText, sources: [] };
      } else if (inputType === 'URL' && youtubeUrl) {
        result = await geminiService.analyzeYoutubeUrlToPrompt(youtubeUrl);
      }

      if (result) {
        setVisualPrompt(result.text);
        setSources(result.sources || []);
        setStatus({ step: ProcessingStep.DREAMING, progress: 100, message: 'PROMPT_SYNTHESIZED' });
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      setStatus({ step: ProcessingStep.ERROR, progress: 0, message: 'ANALYSIS_FAILED', error: error.message });
    }
  };

  const generateFinalImage = async () => {
    if (!visualPrompt) return;
    try {
      setStatus({ step: ProcessingStep.PAINTING, progress: 85, message: 'IMAGEN_RENDERING' });
      const imageUrl = await geminiService.generateSynesthesiaImage(visualPrompt);
      setResultImage(imageUrl);
      setStatus({ step: ProcessingStep.COMPLETED, progress: 100, message: 'PROCESS_COMPLETE' });
    } catch (error: any) {
      setStatus({ step: ProcessingStep.ERROR, progress: 0, message: 'RENDERING_FAILURE', error: error.message });
    }
  };

  const reset = () => {
    setFile(null);
    setYoutubeUrl("");
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setResultImage(null);
    setVisualPrompt("");
    setSources([]);
    setStatus({ step: ProcessingStep.IDLE, progress: 0, message: 'READY_TO_START' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-12 pb-32 selection:bg-lime-400 selection:text-black relative min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 border-b-2 border-white/20 pb-10 shrink-0">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2.5 h-2.5 bg-lime-400 rounded-full animate-pulse shadow-[0_0_15px_#bef264]"></div>
            <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-lime-400 uppercase">SYN_KERNEL_V3.0 // ANCHORED_MODULARITY</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter leading-[0.8] mb-3 animate-glitch cursor-default select-none text-white">
            SYNESTHESIA <span className="text-lime-400">AI</span>
          </h1>
          <p className="text-neutral-500 font-mono text-[9px] uppercase tracking-[0.4em] border-l-2 border-lime-400 pl-6 py-1">
            Visual Transcoding Engine / Matrix v4.2
          </p>
        </div>
        <div className="flex items-center gap-8 text-white">
           <div className="text-right hidden md:block">
              <div className="font-mono text-[9px] text-neutral-600 uppercase tracking-widest mb-1">DATA_STATUS</div>
              <div className="font-mono text-[11px] font-bold uppercase tracking-tighter text-lime-400">{status.message}</div>
           </div>
           <div className="h-14 w-14 border border-white/30 rounded-full flex items-center justify-center text-lime-400 text-xl shadow-[0_0_30px_rgba(190,242,100,0.05)] crt-flicker">
              <i className="fa-solid fa-bolt-lightning"></i>
           </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 grid md:grid-cols-[1fr_1.1fr] gap-x-20">
        
        {/* ROW 1: Toggles */}
        <div className="mb-10 min-h-[50px]">
          {status.step === ProcessingStep.IDLE && !visualPrompt && (
            <div className="flex bg-neutral-900 border border-white/10 p-1 w-fit animate-in fade-in duration-700">
              <button 
                onClick={() => setInputType('FILE')}
                className={`px-10 py-3 font-mono text-[10px] font-black uppercase transition-all duration-500 ${inputType === 'FILE' ? 'bg-white text-black' : 'text-neutral-600 hover:text-white'}`}
              >
                LOCAL_UPLOAD
              </button>
              <button 
                onClick={() => setInputType('URL')}
                className={`px-10 py-3 font-mono text-[10px] font-black uppercase transition-all duration-500 ${inputType === 'URL' ? 'bg-white text-black' : 'text-neutral-600 hover:text-white'}`}
              >
                URL_STREAM
              </button>
            </div>
          )}
        </div>
        <div className="hidden md:block"></div>

        {/* ROW 2 - LEFT: Interaction Area */}
        <section className="self-start animate-in fade-in slide-in-from-left-6 duration-1000">
          {status.step === ProcessingStep.IDLE && !visualPrompt ? (
            <div className="space-y-6">
              {(file || youtubeUrl) ? (
                <div className="bg-neutral-950 border border-white/20 p-10 space-y-10 shadow-2xl animate-in zoom-in-95 duration-500">
                  <div className="space-y-8">
                    <div className="flex justify-between items-end border-b border-white/5 pb-6">
                      <div className="space-y-1">
                        <h4 className="font-mono text-[9px] text-lime-400 font-bold tracking-[0.5em] uppercase">SYSTEM_BUFFER</h4>
                        <div className="text-lg font-black uppercase truncate max-w-[280px] font-mono text-white tracking-tighter">
                          {file ? file.name : 'REMOTE_STREAM_ID'}
                        </div>
                      </div>
                      <div className="font-mono text-[9px] text-lime-400/60 uppercase">READY</div>
                    </div>
                    
                    {file && <AudioVisualizer audioFile={file} isActive={true} />}
                    
                    {file && audioUrl && (
                      <div className="p-1 bg-black border border-white/5">
                        <audio src={audioUrl} controls className="w-full filter invert contrast-125 saturate-0 opacity-50 hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={startAnalysis}
                      className="w-full py-7 bg-lime-400 text-black font-black uppercase tracking-[0.3em] text-sm hover:bg-white transition-all shadow-[0_15px_40px_rgba(190,242,100,0.1)] active:scale-95 duration-500 font-mono"
                    >
                      INITIALIZE_ANALYSIS
                    </button>
                    <button onClick={reset} className="font-mono text-[9px] text-neutral-600 hover:text-red-500 uppercase tracking-widest transition-colors py-2">
                      [ TERMINATE_OBJECT ]
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group border border-white/10 hover:border-lime-400/40 p-24 text-center cursor-pointer transition-all duration-1000 bg-neutral-950 relative overflow-hidden flex flex-col justify-center items-center h-[400px] shadow-inner"
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" className="hidden" />
                  <div className="relative z-10 space-y-6">
                    <div className="w-20 h-20 border border-white/5 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 group-hover:border-lime-400/20 transition-all duration-1000">
                      <i className="fa-solid fa-satellite-dish text-4xl text-neutral-800 group-hover:text-lime-400 transition-colors duration-700"></i>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black mb-1 uppercase tracking-tighter font-mono text-white group-hover:tracking-normal transition-all duration-700">
                        {inputType === 'FILE' ? 'CONNECT_DATA_PACK' : 'WAITING_FOR_LINK'}
                      </h3>
                      <p className="text-neutral-600 font-mono text-[9px] uppercase tracking-[0.5em] group-hover:text-lime-400/50 transition-colors">Awaiting transmission...</p>
                    </div>
                  </div>
                  {inputType === 'URL' && (
                     <div className="absolute inset-0 p-12 flex items-center bg-black/90 z-20 animate-in fade-in duration-500">
                        <div className="w-full space-y-6">
                           <input 
                              type="text" 
                              value={youtubeUrl}
                              onChange={(e) => setYoutubeUrl(e.target.value)}
                              placeholder="PASTE_URL_HERE..."
                              className="w-full bg-transparent border-b border-white/20 p-4 font-mono text-sm text-lime-400 outline-none focus:border-lime-400 transition-all"
                              onClick={(e) => e.stopPropagation()}
                           />
                           <p className="font-mono text-[8px] text-neutral-600 uppercase tracking-widest">GEMINI_GROUNDING ACTIVE</p>
                        </div>
                     </div>
                  )}
                  <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                </div>
              )}
            </div>
          ) : status.step === ProcessingStep.COMPLETED ? (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
               <div className="relative p-1 bg-white shadow-[0_50px_100px_rgba(0,0,0,0.8)] crt-flicker group overflow-hidden">
                <img src={resultImage!} alt="GEN_ART" className="w-full h-auto aspect-square object-cover" />
                <div className="absolute bottom-4 right-4">
                  <a href={resultImage!} download={`synth_art_${Date.now()}.png`} className="w-14 h-14 bg-black text-white flex items-center justify-center hover:bg-lime-400 hover:text-black transition-all border border-white/20 shadow-2xl duration-500 group-hover:scale-110">
                      <i className="fa-solid fa-arrow-down-long text-xl"></i>
                  </a>
                </div>
              </div>
              {/* Sources display for URL input */}
              {sources.length > 0 && (
                <div className="mt-8 p-6 bg-neutral-900 border border-white/5 space-y-4">
                  <h6 className="font-mono text-[8px] text-lime-400 uppercase tracking-widest">SOURCE_VERIFICATION</h6>
                  <div className="flex flex-wrap gap-4">
                    {sources.map((chunk, i) => (
                      chunk.web && (
                        <a 
                          key={i} 
                          href={chunk.web.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-mono text-[9px] text-neutral-500 hover:text-white transition-colors flex items-center gap-2 border border-white/10 px-3 py-1 bg-black"
                        >
                          <i className="fa-solid fa-link text-[8px]"></i>
                          {chunk.web.title || 'LINK'}
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-neutral-950 border border-white/10 p-12 space-y-12 animate-in fade-in duration-700 shadow-2xl relative overflow-hidden">
               <div className="flex justify-between items-center border-b border-white/5 pb-6">
                  <h4 className="font-mono text-[9px] text-lime-400 font-bold uppercase tracking-widest">CORE_SYNTHESIS_v4</h4>
                  <div className="flex gap-1">
                     <div className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse"></div>
                     <div className="w-1.5 h-1.5 bg-lime-400/30 rounded-full"></div>
                  </div>
               </div>
               
               <div className="space-y-10 py-6">
                  <div className="space-y-3">
                    <div className="flex justify-between font-mono text-[9px] text-neutral-600 uppercase">
                       <span>PROCESSING_LOAD</span>
                       <span className="text-white">{status.progress}%</span>
                    </div>
                    <div className="relative h-1 bg-neutral-900 w-full overflow-hidden">
                       <div className="absolute top-0 left-0 h-full bg-lime-400 shadow-[0_0_20px_#bef264] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ width: `${status.progress}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="font-mono text-[8px] text-neutral-700 uppercase tracking-[0.5em]">SYSLOG_MSG</p>
                    <p className="text-xl font-black text-white uppercase font-mono tracking-tighter animate-pulse">{status.message}</p>
                  </div>
               </div>

               <button onClick={reset} className="font-mono text-[9px] text-neutral-700 hover:text-red-500 uppercase tracking-widest transition-colors w-full text-center">
                  [ ABORT_TRANSACTION ]
               </button>
            </div>
          )}
        </section>

        {/* ROW 2 - RIGHT: Steps & Manifest */}
        <section className="space-y-6 pt-10 md:pt-0 border-l border-white/5 pl-12 flex flex-col justify-center self-start min-h-[400px]">
          {[
            { id: '01.', title: 'SONIC_EXTRACTION', desc: "Frequency & timbre analysis to isolate the track's DNA via Gemini multimodal kernel." },
            { id: '02.', title: 'VISUAL_SYNTHESIS', desc: "Generating high-entropy artistic prompts from emotional and textural audio metadata." },
            { id: '03.', title: 'NEURAL_GENERATION', desc: "Compiling visual matrices into 1K resolution imagery via Imagen-4.0 neural layers." }
          ].map((step, idx) => (
            <div 
              key={step.id}
              className="group relative cursor-default transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-6 py-8 border-b border-white/5 last:border-b-0"
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start gap-10">
                <span className="font-mono text-3xl font-black text-neutral-900 group-hover:text-lime-400 transition-all duration-700 group-hover:drop-shadow-[0_0_15px_rgba(190,242,100,0.6)]">
                  {step.id}
                </span>
                <div className="flex-1 transition-all duration-700">
                  <h3 className="text-2xl font-black text-white/80 uppercase tracking-tighter group-hover:tracking-[0.2em] group-hover:text-white transition-all duration-1000 flex items-center gap-4">
                    <span className="opacity-0 group-hover:opacity-100 transition-all duration-1000 text-lime-400 font-light translate-x-3 group-hover:translate-x-0">[</span>
                    {step.title}
                    <span className="opacity-0 group-hover:opacity-100 transition-all duration-1000 text-lime-400 font-light -translate-x-3 group-hover:translate-x-0">]</span>
                  </h3>
                  <div className="max-h-0 opacity-0 group-hover:max-h-32 group-hover:opacity-100 overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    <p className="text-neutral-500 font-mono uppercase text-[10px] tracking-[0.25em] pt-6 leading-relaxed max-w-sm">
                      {`>> ${step.desc}`}
                    </p>
                    <div className="w-14 h-[1px] bg-lime-400 mt-6 scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-left shadow-[0_0_10px_#bef264]"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Prompt Editor */}
          {status.step === ProcessingStep.DREAMING && visualPrompt && (
            <div className="mt-16 animate-in slide-in-from-top-12 fade-in duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
               <div className="space-y-8 bg-neutral-950 p-10 border border-white/10 shadow-2xl">
                 <div className="flex items-center justify-between border-b border-white/5 pb-6">
                    <h2 className="text-xl font-black uppercase tracking-widest font-mono text-white">PROMPT_ENGINEER</h2>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-lime-400 rounded-full animate-ping"></div>
                        <span className="font-mono text-[8px] text-lime-400 font-black uppercase tracking-[0.4em]">STABLE_LINK</span>
                    </div>
                 </div>
                 <div className="relative group">
                    <textarea 
                        value={visualPrompt}
                        onChange={(e) => setVisualPrompt(e.target.value)}
                        className="w-full h-40 bg-black border border-white/5 p-8 font-mono text-[11px] leading-relaxed text-neutral-300 focus:border-lime-400/40 outline-none transition-all resize-none shadow-inner"
                    />
                    <div className="absolute top-6 right-6 opacity-5 group-focus-within:opacity-40 transition-opacity">
                        <i className="fa-solid fa-keyboard text-2xl text-lime-400"></i>
                    </div>
                 </div>
                 <button onClick={generateFinalImage} className="group relative w-full py-8 bg-lime-400 text-black font-black text-lg overflow-hidden transition-all duration-500 hover:bg-white active:scale-[0.98]">
                    <span className="relative z-10 font-mono tracking-[0.4em]">COMPILE_VISUAL_ARTIFACT</span>
                 </button>
               </div>
            </div>
          )}

          {/* Results Summary / Manifest */}
          {status.step === ProcessingStep.COMPLETED && (
            <div className="mt-20 space-y-16 animate-in fade-in slide-in-from-right-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
               <h2 className="text-7xl font-black tracking-tighter uppercase leading-[0.75] font-mono text-white animate-glitch">
                  OUTPUT<br/><span className="text-lime-400">MANIFEST</span>
               </h2>
               <div className="bg-neutral-950 border-l-2 border-lime-400 p-12 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rotate-45 translate-x-16 -translate-y-16"></div>
                  <h5 className="font-mono text-[8px] text-neutral-600 uppercase mb-8 tracking-[0.5em] font-black">RECONSTRUCTED_LOG:</h5>
                  <p className="text-lg italic font-light text-white leading-relaxed font-mono uppercase tracking-tight">"{visualPrompt}"</p>
               </div>
               <button onClick={reset} className="w-full py-10 bg-white text-black font-black text-lg uppercase tracking-[0.6em] hover:bg-lime-400 transition-all font-mono active:scale-95 duration-500 shadow-2xl">
                 NEW_INSTANCE_INIT
               </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer Branding */}
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-black/90 backdrop-blur-md border-t border-white/10 py-6 px-6 shrink-0">
         <div className="max-w-7xl mx-auto flex justify-between items-center font-mono text-[8px] text-neutral-500 uppercase tracking-[0.7em]">
            <div className="flex items-center gap-8">
               <span className="hover:text-lime-400 transition-colors cursor-help">SYNESTHESIA_LABS_2025</span>
               <span className="hidden lg:inline text-neutral-800">•</span>
               <span className="hidden lg:inline">NODE_0x2A9F</span>
            </div>
            <span className="text-neutral-900 hidden lg:block tracking-[1.5em]">ROOT_ACCESS_LEVEL_10</span>
            <span className="flex items-center gap-4">
               <div className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse shadow-[0_0_10px_#bef264]"></div>
               CORE_STABLE
            </span>
         </div>
      </footer>
    </div>
  );
};

export default App;
