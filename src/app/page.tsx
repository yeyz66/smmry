'use client';

import { useState, useRef, useEffect } from 'react';
// Removed unused import jsPDF
// import { jsPDF } from "jspdf";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  Trash2, 
  Settings, 
  Copy, 
  Loader2, 
  AlertTriangle,
  Download,
  Share2,
  FileText,
  Minimize2,
  RefreshCw,
  Save,
  Edit
} from "lucide-react";
import useSummarize, { SummaryLength, SummaryStyle } from "@/hooks/useSummarize";

export default function Home() {
  const [text, setText] = useState("");
  const [options, setOptions] = useState({
    length: 'short' as SummaryLength,
    style: 'concise' as SummaryStyle,
    complexity: 3,
  });
  const { summarize, reset, isLoading, error, result } = useSummarize();
  const [showOptions, setShowOptions] = useState(false);
  
  // Refs for dropdown and button
  const optionsButtonRef = useRef<HTMLButtonElement>(null);
  const optionsDropdownRef = useRef<HTMLDivElement>(null);

  // Effect to handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showOptions &&
        optionsButtonRef.current &&
        !optionsButtonRef.current.contains(event.target as Node) &&
        optionsDropdownRef.current &&
        !optionsDropdownRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };

    // Add listener if dropdown is open
    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions]); // Dependency array includes showOptions
  
  // Handle user actions
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };
  
  const handleClear = () => {
    setText("");
    reset();
  };
  
  const handleSummarize = () => {
    summarize(text, options);
  };
  
  const handleCopy = async () => {
    if (!result?.summary) return;
    
    try {
      await navigator.clipboard.writeText(result.summary);
      alert("Summary copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Unable to copy. Please select and copy manually.");
    }
  };
  
  // Options handlers
  const handleLengthChange = (length: SummaryLength) => {
    setOptions(prev => ({ ...prev, length }));
  };
  
  const handleStyleChange = (style: SummaryStyle) => {
    setOptions(prev => ({ ...prev, style }));
  };
  
  const handleComplexityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const complexity = parseInt(e.target.value);
    setOptions(prev => ({ ...prev, complexity }));
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Effortless Text Summarization</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Quickly condense articles, reports, and documents into key points with our AI-powered tool.
          </p>
          <button 
            onClick={() => document.getElementById('summarizer-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors"
          >
            Start Summarizing
          </button>
        </section>
        
        {/* Summarizer Section */}
        <section id="summarizer-section" className="py-16 border-t">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Area */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Your Text</h2>
                <div className="flex items-center gap-2">
                  <button title="Settings" className="p-2 text-muted-foreground hover:text-foreground"><Settings size={18} /></button>
                  <button title="Clear Text" onClick={handleClear} className="p-2 text-muted-foreground hover:text-foreground"><Trash2 size={18} /></button>
                </div>
              </div>
              <textarea
                value={text}
                onChange={handleTextChange}
                placeholder="Paste your text here... (min 10 characters)"
                rows={15}
                className="w-full p-4 border rounded-md bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              />
              
              {/* Input Footer with Options Dropdown and Summarize Button */}
              <div className="flex justify-between items-center mt-4 relative">
                <div className="text-sm text-muted-foreground">
                  {text.length} characters
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Options Dropdown Button */}
                  <div className="relative inline-block text-left">
                    <button 
                      ref={optionsButtonRef}
                      onClick={() => setShowOptions(!showOptions)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      <Settings size={16} />
                      Summarization Options
                    </button>
                    
                    {/* Options Dropdown Content (Conditionally Rendered) */}
                    {showOptions && (
                      <div 
                        ref={optionsDropdownRef}
                        className="origin-bottom-right absolute right-0 bottom-full mb-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 p-4 space-y-4"
                      >
                        {/* Length Option */}
                        <div>
                          <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-1">Summary Length</label>
                          <select 
                            id="length" 
                            value={options.length}
                            onChange={(e) => handleLengthChange(e.target.value as SummaryLength)}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-primary focus:border-primary"
                           >
                            <option value="very-short">Very Short (10%)</option>
                            <option value="short">Short (25%)</option>
                            <option value="medium">Medium (50%)</option>
                            <option value="long">Long (75%)</option>
                          </select>
                        </div>
                        {/* Style Option */}
                        <div>
                          <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-1">Summary Style</label>
                          <select 
                            id="style" 
                            value={options.style}
                            onChange={(e) => handleStyleChange(e.target.value as SummaryStyle)}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-primary focus:border-primary"
                          >
                            <option value="concise">Concise</option>
                            <option value="detailed">Detailed</option>
                            <option value="bullet-points">Bullet Points</option>
                            <option value="academic">Academic</option>
                            <option value="simplified">Simplified</option>
                          </select>
                        </div>
                        {/* Complexity Option */}
                        <div>
                          <label htmlFor="complexity" className="block text-sm font-medium text-gray-700 mb-1">Complexity Level: {options.complexity}</label>
                          <input 
                            type="range" 
                            id="complexity"
                            min="1" 
                            max="5" 
                            step="1" 
                            value={options.complexity}
                            onChange={(e) => handleComplexityChange(e)}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                           />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Summarize Button */}
                  <button
                    onClick={handleSummarize}
                    disabled={isLoading || !text.trim() || text.length < 10}
                    className="btn btn-primary px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Summarizing...
                      </>
                    ) : (
                      <>
                        Summarize
                        <Edit size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Output Area */}
            <div className="space-y-4 p-5">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold">Summary</h2>
                {result?.summary && (
                  <div className="flex items-center gap-2">
                    <button title="Copy Summary" onClick={handleCopy} className="bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 rounded w-9 h-9 flex items-center justify-center"><Copy size={18} /></button>
                    <button title="Download" className="bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 rounded w-9 h-9 flex items-center justify-center"><Download size={18} /></button>
                    <button title="Share" className="bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 rounded w-9 h-9 flex items-center justify-center"><Share2 size={18} /></button>
                  </div>
                )}
              </div>
              <div className="w-full p-5 border rounded-md bg-gray-50 text-card-foreground min-h-[400px] overflow-y-auto relative">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
                {error && (
                  <div className="text-destructive flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Error: {error}
                  </div>
                )}
                {!isLoading && !error && !result?.summary && (
                  <p className="text-muted-foreground text-center pt-10">
                    Your summary will appear here.
                  </p>
                )}
                {!isLoading && !error && result?.summary && (
                  <>
                    <div className="flex justify-between items-start mb-4">
                       <h3 className="text-xl font-semibold">Summary</h3>
                       {result.metadata && (
                         <div className="flex gap-5 text-xs text-gray-600">
                           <div className="flex items-center gap-1">
                             <FileText size={14} />
                             <span>Original: {result.metadata.originalWordCount} words</span>
                           </div>
                           <div className="flex items-center gap-1">
                              <Minimize2 size={14} />
                              <span>Summary: {result.metadata.summaryWordCount} words ({result.metadata.percentReduced}%)</span>
                           </div>
                         </div>
                       )}
                    </div>

                    <div className="whitespace-pre-wrap leading-relaxed"> 
                      {result.summary}
                    </div>

                    <div className="flex justify-end gap-2 mt-5">
                       <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center gap-1">
                          <RefreshCw size={14} />
                          Regenerate
                       </button>
                       <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center gap-1">
                          <Save size={14} />
                          Save
                       </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
        
        {/* Pricing Section */}
        <section id="pricing" className="py-16 bg-secondary">
          <h2 className="text-3xl font-bold text-center mb-12 text-secondary-foreground">Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="border rounded-lg p-6 bg-card text-card-foreground">
               <h3 className="text-lg font-semibold mb-2">Free Plan</h3>
               <p className="text-muted-foreground mb-4">Up to 5 summaries per day.</p>
               <ul className="list-disc list-inside space-y-2 mb-6 text-sm">
                 <li>Summarize texts up to 1,000 words</li>
                 <li>Standard processing speed</li>
                 <li>Basic style & length options</li>
                 <li>Access via Web App</li>
               </ul>
              <button disabled className="w-full px-4 py-2 bg-muted text-muted-foreground rounded-md">
                Your Current Plan
              </button>
            </div>
            {/* Pro Plan */}
            <div className="border rounded-lg p-6 bg-card text-card-foreground">
               <h3 className="text-lg font-semibold mb-2">Pro Plan (Coming Soon)</h3>
               <p className="text-muted-foreground mb-4">
                 <span className="text-2xl font-bold">$9.99</span> / month
               </p>
               <ul className="list-disc list-inside space-y-2 mb-6 text-sm">
                 <li>Unlimited summaries</li>
                 <li>Summarize texts up to 10,000 words</li>
                 <li>Priority processing speed</li>
                 <li>Advanced style & length options</li>
                 <li>Access via Web App & API</li>
                 <li>Early access to new features</li>
               </ul>
              <button disabled className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">
                Coming Soon
              </button>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            Need more? Contact us for enterprise solutions.
          </p>
        </section>
        
        {/* How It Works */}
        <section id="how-it-works" className="py-16">
           <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
           <div className="grid md:grid-cols-3 gap-8">
             <div className="text-center">
               <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold">1</div>
               <h3 className="text-xl font-semibold mb-2">Paste or Upload</h3>
               <p className="text-muted-foreground">Input your text directly or upload a document.</p>
             </div>
             <div className="text-center">
               <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold">2</div>
               <h3 className="text-xl font-semibold mb-2">Customize</h3>
               <p className="text-muted-foreground">Choose summary length, style, and complexity.</p>
             </div>
             <div className="text-center">
               <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold">3</div>
               <h3 className="text-xl font-semibold mb-2">Summarize</h3>
               <p className="text-muted-foreground">Get your concise summary in seconds.</p>
             </div>
           </div>
        </section>
        
        {/* FAQ */}
        <section id="faq" className="py-16 bg-secondary">
          <h2 className="text-3xl font-bold text-center mb-12 text-secondary-foreground">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h3 className="font-semibold text-secondary-foreground">What types of text can I summarize?</h3>
              <p className="text-muted-foreground mt-1">You can summarize articles, reports, emails, research papers, and more. Currently, we support plain text input and plan to add document uploads (.txt, .pdf, .docx) soon.</p>
            </div>
            <div>
              <h3 className="font-semibold text-secondary-foreground">Is there a limit on text length?</h3>
              <p className="text-muted-foreground mt-1">Yes, there is a limit on text length. The current limit is 10,000 words. If you need to summarize longer texts, please contact us for enterprise solutions.</p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 