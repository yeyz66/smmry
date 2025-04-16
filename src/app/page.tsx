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
  FileText,
  Loader2, // Added Loader2
  AlertTriangle, // Added AlertTriangle
  X // Added X for modal close
} from "lucide-react";
import useSummarize, { SummaryLength, SummaryStyle } from "@/hooks/useSummarize";

// Read word limit from environment variable, default to 10000
const WORD_LIMIT = parseInt(process.env.NEXT_PUBLIC_INPUT_WORD_LIMIT || '10000', 10);

export default function Home() { // Changed component name to Home
  const [text, setText] = useState("");
  const [options, setOptions] = useState({
    length: 'short' as SummaryLength,
    style: 'concise' as SummaryStyle,
    complexity: 3,
  });
  const [showOptions, setShowOptions] = useState(false);
  const { summarize, reset, isLoading, error, result } = useSummarize();
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
    reset();
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
        const fileText = await file.text(); // Renamed variable to avoid conflict
         const uploadedWordCount = fileText.trim() === '' ? 0 : fileText.trim().split(/\s+/).length;
         if (uploadedWordCount <= WORD_LIMIT) {
           setText(fileText);
         } else {
           const words = fileText.trim().split(/\s+/);
           setText(words.slice(0, WORD_LIMIT).join(' '));
           alert(`Uploaded text exceeds the ${WORD_LIMIT}-word limit and has been truncated.`);
         }
      } else {
        // For other types, in a real application we would upload to server for processing
        // This is just a demo assuming we extracted text
        alert("In a real application, we would process PDF and Word files. Currently only TXT files are supported.");
      }
    } catch (err) {
      console.error("File reading error:", err);
      alert("Failed to read file, please try again or try another file");
    }

    // 清除文件输入，便于再次选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // 添加下载PDF功能
  const handleDownloadPDF = () => {
    if (!result?.summary) return;

    try {
      const doc = new jsPDF();

      // 添加标题
      doc.setFontSize(18);
      doc.text("SummryAI - Text Summary", 20, 20);

      // 添加原文和摘要信息
      doc.setFontSize(12);
      doc.text(`Original: ${result.metadata.originalWordCount} words`, 20, 30);
      doc.text(`Summary: ${result.metadata.summaryWordCount} words (${result.metadata.percentReduced}% reduction)`, 20, 37);

      // 添加摘要正文
      doc.setFontSize(14);
      doc.text("Summary:", 20, 50);

      // 处理摘要文本，确保不超出页面宽度
      const summaryText = result.summary;
      const textLines = doc.splitTextToSize(summaryText, 170); // 页面宽度约为210，留出margin

      // 根据行数调整位置
      doc.text(textLines, 20, 60);

      // 在页面底部添加日期
      const today = new Date();
      const dateStr = today.toLocaleDateString();
      doc.setFontSize(10);
      doc.text(`Generated: ${dateStr}`, 20, 280);

      // 保存PDF
      doc.save("summary.pdf");
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  // 添加分享功能
  const handleShare = () => {
    if (!result?.summary) return;

    // 在真实应用中，你可能会将摘要保存到数据库并生成唯一ID
    // 这里我们使用URL参数来模拟
    const summaryData = {
      summary: result.summary,
      metadata: result.metadata
    };

    // 将摘要数据编码到URL参数中
    const encodedData = encodeURIComponent(JSON.stringify(summaryData));
    // 生成分享URL
    const shareableUrl = `${window.location.origin}/shared-summary?data=${encodedData}`;

    // 仅用于演示，实际上这个URL会很长，实际应用应该使用ID来引用服务器上的内容
    setShareUrl(shareableUrl);
    setShowShareModal(true);
  };

  // 关闭分享模态框
  const closeShareModal = () => {
    setShowShareModal(false);
  };

  // 复制分享链接
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

  // Options handlers
  const handleLengthChange = (length: SummaryLength) => {
    setOptions(prev => ({ ...prev, length }));
    setShowOptions(false); // Close dropdown after selection
  };

  const handleStyleChange = (style: SummaryStyle) => {
    setOptions(prev => ({ ...prev, style }));
    setShowOptions(false); // Close dropdown after selection
  };

  const handleComplexityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const complexity = parseInt(e.target.value);
    setOptions(prev => ({ ...prev, complexity }));
    // Don't close dropdown for range slider
  };

  return (
    <main className="min-h-screen">
      <Header />
      
      <section className="py-12 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">SMMRY: AI Article Summarizer</h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            The fastest way to summarize articles, research papers, and any lengthy text with advanced AI technology.
          </p>
          <div className="flex justify-center gap-4 mb-12">
            <a href="#summarize-tool" className="btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition">
              Summarize an Article
            </a>
          </div>
        </div>
      </section>
      
      <section id="summarize-tool" className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
            <h2 className="text-2xl font-semibold mb-6 text-center sm:text-left">Summarize Any Article in Seconds</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Input Article to Summarize</h3>
                    <div className="flex gap-1">
                      <button 
                        onClick={handlePaste} 
                        className="btn btn-ghost btn-sm tooltip" 
                        data-tip="Paste from clipboard"
                      >
                        <Clipboard size={18} />
                      </button>
                      <button 
                        onClick={triggerFileUpload}
                        className="btn btn-ghost btn-sm tooltip" 
                        data-tip="Upload file"
                      >
                        <Upload size={18} />
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileUpload} 
                          accept=".txt,.pdf,.doc,.docx" 
                          className="hidden" 
                        />
                      </button>
                      <button 
                        onClick={handleClear} 
                        className="btn btn-ghost btn-sm tooltip" 
                        data-tip="Clear"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <textarea 
                    className="w-full h-64 p-4 border rounded-lg"
                    placeholder="Paste or type your article text here to summarize..."
                    value={text}
                    onChange={handleTextChange}
                  ></textarea>
                  
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{charCount} characters</span>
                    <span className={isOverLimit ? 'text-red-500' : ''}>
                      {wordCount} / {WORD_LIMIT} words
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={toggleOptions}
                      className="btn btn-outline btn-sm flex gap-1 items-center"
                    >
                      <Settings size={16} />
                      <span>Options</span>
                    </button>
                    <button 
                      onClick={handleSummarize}
                      disabled={!text.trim() || isLoading || isOverLimit}
                      className="btn btn-primary flex-1 flex gap-1 items-center justify-center"
                    >
                      {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                      <span>Summarize</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">
                    {result ? "Article Summary" : "Summary Results"}
                  </h3>
                  {result && (
                    <div className="flex gap-1">
                      <button 
                        onClick={handleCopy} 
                        className="btn btn-ghost btn-sm tooltip" 
                        data-tip="Copy to clipboard"
                      >
                        <Copy size={18} />
                      </button>
                      <button 
                        onClick={handleDownloadPDF} 
                        className="btn btn-ghost btn-sm tooltip" 
                        data-tip="Download as PDF"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={handleShare} 
                        className="btn btn-ghost btn-sm tooltip" 
                        data-tip="Share"
                      >
                        <Share size={18} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="w-full flex-1 p-4 border rounded-md bg-gray-50 min-h-[300px] overflow-y-auto relative flex flex-col"> {/* Added flex-1 */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-md">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                  )}
                  {error && !isLoading && (
                    <div className="absolute inset-0 bg-red-50 flex items-center justify-center z-10 rounded-md p-4">
                       <div className="text-center text-red-700">
                         <AlertTriangle className="w-10 h-10 mx-auto mb-2" />
                         <p className="font-semibold">Error Generating Summary</p>
                         <p className="text-sm">{error}</p>
                       </div>
                     </div>
                  )}
                  {result?.summary && !isLoading && !error ? (
                    <>
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-3 pb-2 border-b">
                         <span>Original: {result.metadata.originalWordCount} words</span>
                         <span>Reduction: {result.metadata.percentReduced}%</span>
                         <span>Summary: {result.metadata.summaryWordCount} words</span>
                       </div>
                      <div className="prose prose-sm max-w-none flex-1 overflow-y-auto"> {/* Added flex-1 overflow-y-auto */}
                        {options.style === 'bullet-points' ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {result.summary.split('\n- ').map((item, index) => item.trim() && <li key={index}>{item.trim()}</li>)}
                          </ul>
                        ) : (
                          <p>{result.summary.split('\n').map((line, index) => <span key={index}>{line}<br/></span>)}</p>
                        )}
                      </div>
                      <div className="flex justify-end gap-2 mt-4 pt-2 border-t">
                        <button
                          className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm hover:bg-gray-100 transition-colors"
                          onClick={() => summarize(text, options)} // Allow regenerate
                        >
                          <RefreshCcw className="w-3.5 h-3.5" />
                          Regenerate
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm hover:bg-gray-100 transition-colors">
                          <Save className="w-3.5 h-3.5" />
                          Save
                        </button>
                      </div>
                    </>
                  ) : !isLoading && !error && (
                    <div className="text-gray-400 flex flex-col items-center justify-center flex-1 text-center"> {/* Added flex-1 text-center */}
                      <Wand2 className="w-10 h-10 mx-auto mb-3" />
                      <p className="text-lg font-medium mb-1">Your summary will appear here</p>
                      <p className="text-sm max-w-xs">
                        Enter text on the left and click 'Summarize' to generate an AI-powered summary.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Use SMMRY Article Summarizer?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Save Time Reading</h3>
              <p className="text-gray-600">
                Get the key points from any article in seconds. SMMRY condenses lengthy content while preserving the most important information.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Improve Comprehension</h3>
              <p className="text-gray-600">
                Our AI article summarizer extracts the core concepts and key points, making complex information easier to understand.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Research Efficiently</h3>
              <p className="text-gray-600">
                Summarize multiple articles quickly to determine their relevance to your research without reading entire documents.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Share Modal */}
      {showShareModal && shareUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share Summary</h3>
              <button onClick={closeShareModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">Anyone with this link can view the summary:</p>
            <div className="flex items-center border rounded-md p-2 bg-gray-50 mb-4">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 text-sm bg-transparent outline-none"
              />
              <button
                onClick={copyShareLink}
                className="ml-2 px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-400">Note: This is a demo link containing the summary data. In a real application, a shorter, unique link would be generated.</p>
          </div>
        </div>
      )}

      {/* Re-added Sections Below */}
      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-gray-100"> {/* Adjusted background color */}
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="border rounded-lg p-6 bg-white shadow-sm"> {/* Adjusted background and added shadow */}
               <h3 className="text-lg font-semibold mb-2">Free Plan</h3>
               <p className="text-gray-600 mb-4">Up to 5 summaries per day.</p>
               <ul className="list-disc list-inside space-y-2 mb-6 text-sm text-gray-700">
                 <li>Summarize texts up to 10,000 words</li>
                 <li>Standard processing speed</li>
                 <li>Basic style & length options</li>
                 <li>Access via Web App</li>
               </ul>
              <button disabled className="w-full px-4 py-2 bg-gray-200 text-gray-500 rounded-md cursor-not-allowed"> {/* Adjusted button style */}
                Your Current Plan
               </button>
             </div>
            {/* Pro Plan */}
            <div className="border rounded-lg p-6 bg-white shadow-sm"> {/* Adjusted background and added shadow */}
               <h3 className="text-lg font-semibold mb-2">Pro Plan (Coming Soon)</h3>
               <p className="text-gray-600 mb-4">
                 <span className="text-2xl font-bold text-blue-600">$9.99</span> / month {/* Adjusted price color */}
               </p>
               <ul className="list-disc list-inside space-y-2 mb-6 text-sm text-gray-700">
                 <li>Unlimited summaries</li>
                 <li>Summarize texts up to 100,000 words</li>
                 <li>Priority processing speed</li>
                 <li>Advanced style & length options</li>
                 <li>Access via Web App & API</li>
                 <li>Early access to new features</li>
               </ul>
              <button disabled className="w-full px-4 py-2 bg-blue-200 text-blue-700 rounded-md cursor-not-allowed"> {/* Adjusted button style */}
                Coming Soon
               </button>
             </div>
           </div>
          <p className="text-center text-sm text-gray-500 mt-8">
            Need more? Contact us for enterprise solutions.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16">
        <div className="container mx-auto px-4">
           <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">How It Works</h2>
           <div className="grid md:grid-cols-3 gap-8">
             <div className="text-center">
               <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 text-white text-2xl font-bold">1</div>
               <h3 className="text-xl font-semibold mb-2">Paste or Upload</h3>
               <p className="text-gray-600">Input your text directly or upload a document.</p>
             </div>
             <div className="text-center">
               <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 text-white text-2xl font-bold">2</div>
               <h3 className="text-xl font-semibold mb-2">Customize</h3>
               <p className="text-gray-600">Choose summary length, style, and complexity.</p>
             </div>
             <div className="text-center">
               <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 text-white text-2xl font-bold">3</div>
               <h3 className="text-xl font-semibold mb-2">Summarize</h3>
               <p className="text-gray-600">Get your concise summary in seconds.</p>
             </div>
           </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 bg-gray-100"> {/* Adjusted background color */}
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h3 className="font-semibold text-gray-800">What types of text can I summarize?</h3>
              <p className="text-gray-600 mt-1">You can summarize articles, reports, emails, research papers, and more. Currently, we support plain text input and plan to add document uploads (.txt, .pdf, .docx) soon.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Is there a limit on text length?</h3>
              <p className="text-gray-600 mt-1">Yes, there is a limit on text length. The current limit is {WORD_LIMIT.toLocaleString()} words. If you need to summarize longer texts, please contact us for enterprise solutions.</p> {/* Used WORD_LIMIT variable */}
            </div>
            {/* Add more FAQ items as needed */}
          </div>
        </div>
      </section>
    </main>
  );
} 