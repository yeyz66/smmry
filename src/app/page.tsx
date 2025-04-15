'use client';

import { useState } from 'react';
// Removed unused import jsPDF
// import { jsPDF } from "jspdf";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  Trash2, 
  Settings, 
  Copy, 
  Loader2, 
  AlertTriangle 
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border rounded-md bg-card">
                <div>
                  <label htmlFor="length" className="block text-sm font-medium text-muted-foreground mb-1">Length</label>
                  <select 
                    id="length" 
                    value={options.length}
                    onChange={(e) => handleLengthChange(e.target.value as SummaryLength)}
                    className="w-full p-2 border rounded-md bg-input"
                   >
                    <option value="very-short">Very Short</option>
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="long">Long</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="style" className="block text-sm font-medium text-muted-foreground mb-1">Style</label>
                  <select 
                    id="style" 
                    value={options.style}
                    onChange={(e) => handleStyleChange(e.target.value as SummaryStyle)}
                    className="w-full p-2 border rounded-md bg-input"
                  >
                    <option value="concise">Concise</option>
                    <option value="detailed">Detailed</option>
                    <option value="bullet-points">Bullet Points</option>
                    <option value="academic">Academic</option>
                    <option value="simplified">Simplified</option>
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <label htmlFor="complexity" className="block text-sm font-medium text-muted-foreground mb-1">Complexity: {options.complexity}</label>
                  <input 
                    type="range" 
                    id="complexity"
                    min="1" 
                    max="5" 
                    step="1" 
                    value={options.complexity}
                    onChange={(e) => handleComplexityChange(e)}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                   />
                </div>
              </div>
              <button
                onClick={handleSummarize}
                disabled={isLoading || !text.trim() || text.length < 10}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Summarizing...
                  </>
                ) : (
                  'Summarize Text'
                )}
              </button>
            </div>
            
            {/* Output Area */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Summary</h2>
                {result?.summary && (
                  <div className="flex items-center gap-2">
                    <button title="Copy Summary" onClick={handleCopy} className="p-2 text-muted-foreground hover:text-foreground"><Copy size={18} /></button>
                  </div>
                )}
              </div>
              <div className="w-full p-4 border rounded-md bg-card text-card-foreground h-[300px] overflow-y-auto relative">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-card/50">
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
                  <div className="whitespace-pre-wrap">{result.summary}</div>
                )}
              </div>
              {result?.metadata && (
                 <div className="text-sm text-muted-foreground p-4 border rounded-md bg-card space-y-1">
                    <p>Original Words: {result.metadata.originalWordCount}</p>
                    <p>Summary Words: {result.metadata.summaryWordCount} ({result.metadata.percentReduced}% reduction)</p>
                    <p>Settings: {result.metadata.length}, {result.metadata.style}, Complexity {result.metadata.complexity}</p>
                 </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Features Section - Placeholder */}
        <section id="features" className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
             <div>Icon 1 + Feature</div> 
             <div>Icon 2 + Feature</div> 
             <div>Icon 3 + Feature</div> 
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