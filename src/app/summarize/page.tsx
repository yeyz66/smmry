'use client';

import { useState, useMemo } from 'react';
import { useRef } from "react";
import { jsPDF } from "jspdf";
// import { useSearchParams } from 'next/navigation'; // Removed unused import
import Header from "@/components/layout/Header";
import { 
  Clipboard, 
  Upload, 
  Trash2, 
  Settings, 
  Wand2, 
  Copy, 
  Download, 
  Share, 
  RefreshCcw, 
  Save,
  FileText
} from "lucide-react";
import useSummarize, { SummaryLength, SummaryStyle } from "@/hooks/useSummarize";
import { QueueStatus } from "@/components/QueueStatus";

// Read word limit from environment variable, default to 10000
const WORD_LIMIT = parseInt(process.env.NEXT_PUBLIC_INPUT_WORD_LIMIT || '10000', 10);

export default function SummarizePage() {
  const [text, setText] = useState("");
  const [options, setOptions] = useState({
    length: 'short' as SummaryLength,
    style: 'concise' as SummaryStyle,
    complexity: 3,
  });
  const [showOptions, setShowOptions] = useState(false);
  const { summarize, isLoading, error, result, isInQueue, queuePosition } = useSummarize();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Count characters and words
  const charCount = text.length;
  const wordCount = useMemo(() => {
    // Simple word count: split by whitespace, filter empty strings
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  }, [text]);
  const isOverLimit = wordCount > WORD_LIMIT;
  
  // Handle user actions
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const newWordCount = newText.trim() === '' ? 0 : newText.trim().split(/\s+/).length;

    // Only update state if within the word limit
    if (newWordCount <= WORD_LIMIT) {
      setText(newText);
    } else {
      // Optional: Provide feedback that the limit is reached
      // For example, you could set an error state or simply not update
      // To truncate:
      // const words = newText.trim().split(/\s+/);
      // setText(words.slice(0, WORD_LIMIT).join(' '));
      // But preventing further input is often clearer
      console.warn(`Word limit (${WORD_LIMIT}) reached.`);
    }
  };
  
  const handleClear = () => {
    setText("");
  };
  
  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const pastedWordCount = clipboardText.trim() === '' ? 0 : clipboardText.trim().split(/\s+/).length;
      
      if (pastedWordCount <= WORD_LIMIT) {
        setText(clipboardText);
      } else {
        // Truncate pasted text if it exceeds the limit
        const words = clipboardText.trim().split(/\s+/);
        setText(words.slice(0, WORD_LIMIT).join(' '));
        alert(`Pasted text exceeds the ${WORD_LIMIT}-word limit and has been truncated.`);
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
      // User may have denied clipboard permission
      alert("Unable to access clipboard. Please paste manually.");
    }
  };
  
  const handleSummarize = () => {
    // Also check word count limit here, although button should be disabled
    if (isOverLimit) {
      alert(`Input text exceeds the ${WORD_LIMIT}-word limit.`);
      return;
    }
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
  
  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert("File too large, please upload a file smaller than 5MB");
      return;
    }
    
    const allowedTypes = [
      'text/plain', 
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert("Unsupported file type, please upload a TXT, PDF, or DOC/DOCX file");
      return;
    }
    
    try {
      if (file.type === 'text/plain') {
        const text = await file.text();
        setText(text);
      } else {
        // For other types, in a real application we would upload to server for processing
        // This is just a demo assuming we extracted text
        alert("In a real application, we would process PDF and Word files. Currently only TXT files are supported.");
      }
    } catch (err) {
      console.error("File reading error:", err);
      alert("Failed to read file, please try again or try another file");
    }
    
    // Clear file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  // Add download PDF functionality
  const handleDownloadPDF = () => {
    if (!result?.summary) return;
    
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text("SummryAI - Text Summary", 20, 20);
      
      // Add original text and summary information
      doc.setFontSize(12);
      doc.text(`Original: ${result.metadata.originalWordCount} words`, 20, 30);
      doc.text(`Summary: ${result.metadata.summaryWordCount} words (${result.metadata.percentReduced}% reduction)`, 20, 37);
      
      // Add summary content
      doc.setFontSize(14);
      doc.text("Summary:", 20, 50);
      
      // Process summary text, ensure it doesn't exceed page width
      const summaryText = result.summary;
      const textLines = doc.splitTextToSize(summaryText, 170); // Page width is about 210, leaving margin
      
      // Adjust position based on number of lines
      doc.text(textLines, 20, 60);
      
      // Add date at the bottom of the page
      const today = new Date();
      const dateStr = today.toLocaleDateString();
      doc.setFontSize(10);
      doc.text(`Generated: ${dateStr}`, 20, 280);
      
      // Save PDF
      doc.save("summary.pdf");
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };
  
  // Add share functionality
  const handleShare = () => {
    if (!result?.summary) return;
    
    // In a real application, you would likely save the summary to a database and generate a unique ID
    // Here we're using URL parameters to simulate
    const summaryData = {
      summary: result.summary,
      metadata: result.metadata
    };
    
    // Encode summary data into URL parameters
    const encodedData = encodeURIComponent(JSON.stringify(summaryData));
    // Generate share URL
    const shareableUrl = `${window.location.origin}/shared-summary?data=${encodedData}`;
    
    // For demonstration only; in reality this URL would be too long, a real app should use an ID to reference server content
    setShareUrl(shareableUrl);
    setShowShareModal(true);
  };

  // Close share modal
  const closeShareModal = () => {
    setShowShareModal(false);
  };

  // Copy share link
  const copyShareLink = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Unable to copy link, please copy manually.");
    }
  };
  
  return (
    <main>
      <Header />
      
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <div className="flex items-center text-xl font-bold text-blue-500">
              <FileText className="mr-2" />
              <span>SummryAI</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span>John Doe</span>
              <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-medium">
                J
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 min-h-[600px]">
            {/* Input Panel */}
            <div className="p-5 border-r border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Input Text</h2>
                <div className="flex gap-2">
                  <button 
                    className="p-2 bg-gray-100 rounded-md text-gray-600 hover:bg-gray-200 transition-colors" 
                    title="Paste"
                    onClick={handlePaste}
                  >
                    <Clipboard className="w-5 h-5" />
                  </button>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".txt,.pdf,.doc,.docx"
                    className="hidden"
                  />
                  <button 
                    className="p-2 bg-gray-100 rounded-md text-gray-600 hover:bg-gray-200 transition-colors" 
                    title="Upload File"
                    onClick={triggerFileUpload}
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                  
                  <button 
                    className="p-2 bg-gray-100 rounded-md text-gray-600 hover:bg-gray-200 transition-colors" 
                    title="Clear"
                    onClick={handleClear}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <textarea 
                className="w-full min-h-[400px] p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paste or type your text here to summarize..."
                value={text}
                onChange={handleTextChange}
              ></textarea>
              
              <div className="flex justify-between items-center mt-4">
                {/* Display word count and limit */}
                <div className={`text-sm ${isOverLimit ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                  {wordCount} / {WORD_LIMIT} words 
                  <span className="ml-4 text-gray-500">({charCount} characters)</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button 
                      className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors"
                      onClick={toggleOptions}
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">Summarization Options</span>
                    </button>
                    
                    {/* Options Dropdown */}
                    {showOptions && (
                      <div className="absolute bottom-full right-0 mb-2 w-72 bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-10">
                        <div className="mb-3">
                          <label className="block text-sm font-medium mb-1">Summary Length</label>
                          <select 
                            className="w-full p-2 border border-gray-200 rounded-md text-sm"
                            value={options.length}
                            onChange={(e) => setOptions({...options, length: e.target.value as SummaryLength})}
                          >
                            <option value="very-short">Very Short (10%)</option>
                            <option value="short">Short (25%)</option>
                            <option value="medium">Medium (50%)</option>
                            <option value="long">Long (75%)</option>
                          </select>
                        </div>
                        
                        <div className="mb-3">
                          <label className="block text-sm font-medium mb-1">Summary Style</label>
                          <select 
                            className="w-full p-2 border border-gray-200 rounded-md text-sm"
                            value={options.style}
                            onChange={(e) => setOptions({...options, style: e.target.value as SummaryStyle})}
                          >
                            <option value="concise">Concise</option>
                            <option value="detailed">Detailed</option>
                            <option value="bullet-points">Bullet Points</option>
                            <option value="academic">Academic</option>
                            <option value="simplified">Simplified</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Complexity Level: {options.complexity}
                          </label>
                          <input 
                            type="range" 
                            min="1" 
                            max="5" 
                            value={options.complexity} 
                            className="w-full"
                            onChange={(e) => setOptions({...options, complexity: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    className={`mt-4 w-full flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleSummarize}
                    disabled={isLoading || isOverLimit || text.trim().length < 10}
                  >
                    {isLoading ? 'Summarizing...' : 'Summarize'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Output Panel */}
            <div className="p-5">
              {/* Add Queue Status Component */}
              <QueueStatus isInQueue={isInQueue} queuePosition={queuePosition} />
              
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Summary Result</h2>
                <div className="flex gap-2">
                  <button 
                    className={`p-2 bg-gray-100 rounded-md text-gray-600 hover:bg-gray-200 transition-colors ${!result?.summary ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    title="Copy"
                    onClick={handleCopy}
                    disabled={!result?.summary}
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button 
                    className={`p-2 bg-gray-100 rounded-md text-gray-600 hover:bg-gray-200 transition-colors ${!result?.summary ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    title="Download as PDF"
                    onClick={handleDownloadPDF}
                    disabled={!result?.summary}
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button 
                    className={`p-2 bg-gray-100 rounded-md text-gray-600 hover:bg-gray-200 transition-colors ${!result?.summary ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    title="Share"
                    onClick={handleShare}
                    disabled={!result?.summary}
                  >
                    <Share className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-5 min-h-[400px]">
                {error ? (
                  <div className="text-red-500 p-4 bg-red-50 rounded-md">
                    {error}
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : result?.summary ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">Summary</h3>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <span>Original: {result.metadata.originalWordCount} words</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Summary: {result.metadata.summaryWordCount} words ({result.metadata.percentReduced}% reduction)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-gray-700 leading-relaxed">
                      {result.metadata.style === 'bullet-points' ? (
                        <div dangerouslySetInnerHTML={{ __html: result.summary.replace(/\n/g, '<br />') }} />
                      ) : (
                        <p>{result.summary}</p>
                      )}
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-6">
                      <button 
                        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors"
                        onClick={handleSummarize}
                      >
                        <RefreshCcw className="w-4 h-4" />
                        <span className="text-sm">Regenerate</span>
                      </button>
                      <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors">
                        <Save className="w-4 h-4" />
                        <span className="text-sm">Save</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500 flex flex-col items-center justify-center h-full">
                    <div className="text-center mb-4">
                      <Wand2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium">Your summary will appear here</p>
                    </div>
                    <p className="text-sm max-w-md text-center">
                      Enter your text in the input panel and click the Summarize button to generate an AI-powered summary.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 分享链接模态框 */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">分享摘要</h3>
            <p className="mb-4 text-sm text-gray-600">
              复制以下链接以分享您的摘要：
            </p>
            
            <div className="flex">
              <input 
                type="text" 
                value={shareUrl || ''} 
                readOnly 
                className="flex-1 p-2 border border-gray-200 rounded-l-md text-sm"
              />
              <button 
                onClick={copyShareLink}
                className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition-colors"
              >
                复制
              </button>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={closeShareModal}
                className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 