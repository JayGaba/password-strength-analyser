// app/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, EyeOff, Shield, AlertTriangle, Check, X, Upload, 
  Lightbulb, RefreshCw, Lock, Download
} from 'lucide-react';
import HackerSecurityAnimation from './components/HackerSecurityAnimation';
import BulkAnalysisResults from './components/BulkAnalysisResults';
import { BulkAnalysisResult } from '@/utils/passwordAnalysis';

export default function PasswordSecurityAnalyzer() {
  // Single password analysis states
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [timeToCrack, setTimeToCrack] = useState('');
  const [strengthReview, setStrengthReview] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestedPassword, setSuggestedPassword] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
    hasMinLength: false,
    hasRecommendedLength: false
  });

  // Bulk analysis states
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BulkAnalysisResult | null>(null);

  // Generate a strong suggested password
  const generateStrongPassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_-+=<>?';
    
    const allChars = uppercase + lowercase + numbers + special;
    let generated = '';
    
    // Ensure we have at least one of each required character type
    generated += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    generated += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    generated += numbers.charAt(Math.floor(Math.random() * numbers.length));
    generated += special.charAt(Math.floor(Math.random() * special.length));
    
    // Fill the rest of the password (12-16 characters total)
    const length = 12 + Math.floor(Math.random() * 5);
    
    while (generated.length < length) {
      generated += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password characters
    return generated.split('').sort(() => 0.5 - Math.random()).join('');
  };

  // Generate password on component mount
  useEffect(() => {
    setSuggestedPassword(generateStrongPassword());
  }, []);

  // Handle click outside to close suggestion popup
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestion(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [suggestionRef]);

  // Calculate password strength with 5 levels and specific time estimates
  const calculateStrength = (pwd: string) => {
    if (!pwd) return { 
      score: 0, 
      feedback: [], 
      time: '', 
      review: '', 
      requirements: {
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false,
        hasMinLength: false,
        hasRecommendedLength: false
      }
    };
    
    let score = 0;
    const feedback: string[] = [];
    
    // Track individual requirements
    const requirements = {
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[^A-Za-z0-9]/.test(pwd),
      hasMinLength: pwd.length >= 8,
      hasRecommendedLength: pwd.length >= 12
    };
    
    // Length check with bonus for longer passwords
    if (requirements.hasRecommendedLength) {
      score += 20;
    } else if (requirements.hasMinLength) {
      score += 15;
    } else {
      feedback.push('Password should be at least 8 characters');
    }
    
    // Uppercase check
    if (requirements.hasUppercase) {
      score += 20;
    } else {
      feedback.push('Add an uppercase letter');
    }
    
    // Lowercase check
    if (requirements.hasLowercase) {
      score += 20;
    } else {
      feedback.push('Add a lowercase letter');
    }
    
    // Number check
    if (requirements.hasNumber) {
      score += 20;
    } else {
      feedback.push('Add a number');
    }
    
    // Special character check
    if (requirements.hasSpecial) {
      score += 20;
    } else {
      feedback.push('Add a special character');
    }
    
    // Calculate time to crack and review
    let time = '';
    let review = '';
    
    // Check if all requirements are met for Ultimate level
    const allRequirementsMet = 
      requirements.hasUppercase &&
      requirements.hasLowercase &&
      requirements.hasNumber &&
      requirements.hasSpecial &&
      requirements.hasRecommendedLength;
    
    if (allRequirementsMet && score === 100) {
      time = 'Ultimate';
      review = 'This password has achieved the highest possible security level. Virtually unbreakable with current technology.';
    } else if (score < 30) {
      time = 'Instantly';
      review = 'This password offers virtually no protection. It would be cracked immediately.';
    } else if (score < 50) {
      time = 'Seconds';
      review = 'This password is very vulnerable. Any basic hacking attempt would break it.';
    } else if (score < 70) {
      time = 'Weeks';
      review = 'Your password has basic protection but could be compromised with moderate effort.';
    } else if (score < 90) {
      time = '10,000+ years';
      review = 'Very strong password. Most hackers would give up before cracking this.';
    } else {
      time = '3+ billion years';
      review = 'Fantastic, using that password makes you as secure as Fort Knox.';
    }
    
    return { score, feedback, time, review, requirements };
  };

  useEffect(() => {
    const result = calculateStrength(password);
    setStrength(result.score);
    setFeedback(result.feedback);
    setTimeToCrack(result.time);
    setStrengthReview(result.review);
    setPasswordRequirements(result.requirements);
  }, [password]);

  const getStrengthLabel = () => {
    if (strength === 0) return 'Enter Password';
    
    // Add Ultimate level
    if (timeToCrack === 'Ultimate') return 'Ultimate';
    
    if (strength < 30) return 'Very Weak';
    if (strength < 50) return 'Weak';
    if (strength < 70) return 'Fair';
    if (strength < 90) return 'Strong';
    return 'Very Strong';
  };

  const getStrengthColor = () => {
    if (strength === 0) return 'bg-gray-200';
    
    // Add Ultimate level with purple color
    if (timeToCrack === 'Ultimate') return 'bg-purple-500';
    
    if (strength < 30) return 'bg-red-600';
    if (strength < 50) return 'bg-red-500';
    if (strength < 70) return 'bg-orange-500';
    if (strength < 90) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const handleSuggestionClick = () => {
    setShowSuggestion(!showSuggestion);
    // Generate a new password whenever the icon is clicked
    if (!showSuggestion) {
      setSuggestedPassword(generateStrongPassword());
    }
  };

  const applyPasswordSuggestion = () => {
    setPassword(suggestedPassword);
    setShowSuggestion(false);
  };

  const generateNewPassword = () => {
    setSuggestedPassword(generateStrongPassword());
  };

  // Bulk analysis handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      // Check file type
      const fileName = droppedFile.name.toLowerCase();
      if (!fileName.endsWith('.csv') && !fileName.endsWith('.txt')) {
        setError('Only CSV and TXT files are allowed');
        return;
      }
      
      setFile(droppedFile);
      setError(null);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }
      
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadReport = async () => {
    if (!results) return;
    
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ results }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }
      
      // Get the CSV content
      const csvContent = await response.text();
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', 'password_analysis_report.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download report');
    }
  };

  const resetAnalysis = () => {
    setResults(null);
    setFile(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <header className="mb-10 text-center">
            <div className="flex justify-center mb-4">
              <Shield size={48} className="text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Password Security Analyzer</h1>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Analyze individual passwords or bulk password files to assess security strength and identify vulnerabilities.
            </p>
          </header>

          {/* Tab Navigation */}
          <div className="flex mb-6 border-b border-slate-700">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'single' 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Single Password
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'bulk' 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bulk Analysis
            </button>
          </div>

          {/* Single Password Analysis */}
          {activeTab === 'single' && (
            <div className="bg-slate-800 rounded-xl shadow-2xl p-8 mb-8 border border-slate-700">
              <div className="mb-6 relative">
                <label htmlFor="password" className="block text-slate-300 mb-2 text-sm font-medium">
                  Enter Your Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 rounded-lg bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Type your password here..."
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-3">
                    {/* Suggestion lightbulb button */}
                    <button
                      type="button"
                      onClick={handleSuggestionClick}
                      className="text-slate-400 hover:text-yellow-400 transition"
                      aria-label="Suggest a strong password"
                    >
                      <Lightbulb size={20} />
                    </button>
                    
                    {/* Eye toggle button */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-white transition"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* Password suggestion popup */}
                  {showSuggestion && (
                    <div
                      ref={suggestionRef}
                      className="absolute right-0 top-full mt-2 p-4 bg-slate-900 rounded-lg shadow-lg border border-slate-700 w-full md:w-80 z-10"
                    >
                      <div className="text-sm mb-3 text-slate-300 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Lightbulb size={20} className="text-yellow-400" />
                          <span className="font-medium">Suggested Strong Password</span>
                        </div>
                        
                        {/* Refresh button */}
                        <div className="relative top-1">
                          <button
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                            onClick={generateNewPassword}
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                          >
                            <RefreshCw size={20} />
                          </button>
                          
                          {/* Tooltip */}
                          {showTooltip && (
                            <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-700 text-xs rounded whitespace-nowrap">
                              Generate another
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs mb-2">Hover to reveal, click to use</p>
                      
                      <div
                        className="mb-2 p-3 bg-slate-800 rounded border border-slate-700 cursor-pointer text-center"
                        onClick={applyPasswordSuggestion}
                      >
                        <div className="relative">
                          <p className="blur-sm hover:blur-none transition-all duration-300 select-none">
                            {suggestedPassword}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar with 6 Strength Levels (including Ultimate) */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-300">Password Strength</span>
                  <span className={`text-sm font-medium ${
                    timeToCrack === 'Ultimate' ? 'text-purple-400' :
                    strength < 30 ? 'text-red-500' : 
                    strength < 50 ? 'text-red-400' : 
                    strength < 70 ? 'text-orange-400' : 
                    strength < 90 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {getStrengthLabel()}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getStrengthColor()} transition-all duration-500 ease-in-out`}
                    style={{ width: `${strength}%` }}
                  ></div>
                </div>
              </div>

              {/* Password Feedback */}
              {password && (
                <div className="bg-slate-900 rounded-lg p-4 mb-6 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={18} className={
                      timeToCrack === 'Ultimate' ? 'text-purple-500' :
                      strength >= 90 ? 'text-green-500' : 
                      (strength >= 70 ? 'text-yellow-400' : 'text-slate-400')
                    } />
                    <h3 className="font-semibold">Security Analysis</h3>
                  </div>
                  
                  {/* Time to Crack with Security Animation */}
                  {timeToCrack && (
                    <HackerSecurityAnimation 
                      timeToCrack={timeToCrack} 
                      strengthReview={strengthReview} 
                      passwordRequirements={passwordRequirements}
                    />
                  )}

                  {/* Requirements List */}
                  <ul className="space-y-2 mt-3">
                    <li className={`flex items-start gap-2 text-sm ${passwordRequirements.hasUppercase ? 'text-green-400' : 'text-slate-300'}`}>
                      <div className="min-w-6 mt-0.5">
                        {passwordRequirements.hasUppercase ? <Check size={16} /> : <X size={16} className="text-slate-500" />}
                      </div>
                      <span>Contains uppercase letter</span>
                    </li>
                    <li className={`flex items-start gap-2 text-sm ${passwordRequirements.hasLowercase ? 'text-green-400' : 'text-slate-300'}`}>
                      <div className="min-w-6 mt-0.5">
                        {passwordRequirements.hasLowercase ? <Check size={16} /> : <X size={16} className="text-slate-500" />}
                      </div>
                      <span>Contains lowercase letter</span>
                    </li>
                    <li className={`flex items-start gap-2 text-sm ${passwordRequirements.hasNumber ? 'text-green-400' : 'text-slate-300'}`}>
                      <div className="min-w-6 mt-0.5">
                        {passwordRequirements.hasNumber ? <Check size={16} /> : <X size={16} className="text-slate-500" />}
                      </div>
                      <span>Contains number</span>
                    </li>
                    <li className={`flex items-start gap-2 text-sm ${passwordRequirements.hasSpecial ? 'text-green-400' : 'text-slate-300'}`}>
                      <div className="min-w-6 mt-0.5">
                        {passwordRequirements.hasSpecial ? <Check size={16} /> : <X size={16} className="text-slate-500" />}
                      </div>
                      <span>Contains special character</span>
                    </li>
                    <li className={`flex items-start gap-2 text-sm ${passwordRequirements.hasMinLength ? 'text-green-400' : 'text-slate-300'}`}>
                      <div className="min-w-6 mt-0.5">
                        {passwordRequirements.hasMinLength ? <Check size={16} /> : <X size={16} className="text-slate-500" />}
                      </div>
                      <span>At least 8 characters long</span>
                    </li>
                    <li className={`flex items-start gap-2 text-sm ${passwordRequirements.hasRecommendedLength ? 'text-green-400' : 'text-slate-300'}`}>
                      <div className="min-w-6 mt-0.5">
                        {passwordRequirements.hasRecommendedLength ? <Check size={16} /> : <X size={16} className="text-slate-500" />}
                      </div>
                      <span>12+ characters (recommended)</span>
                    </li>
                  </ul>

                  {/* Additional Feedback */}
                  {feedback.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-slate-300 text-sm mb-2">Suggestions to improve:</p>
                      <ul className="space-y-1">
                        {feedback.map((item, index) => (
                          <li key={index} className="text-sm text-red-400 flex items-start gap-2">
                            <div className="min-w-6 mt-0.5">
                              <AlertTriangle size={16} />
                            </div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bulk Password Analysis */}
          {activeTab === 'bulk' && !results && (
            <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
              <div 
                className={`border-2 border-dashed rounded-xl p-10 text-center ${
                  file ? 'border-blue-500 bg-slate-800/50' : 'border-slate-600 bg-slate-800/30'
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="flex justify-center mb-4">
                  <Upload size={40} className={file ? 'text-blue-500' : 'text-slate-400'} />
                </div>
                
                <h3 className="text-xl font-medium mb-2">Upload Password File</h3>
                <p className="text-slate-300 mb-6 max-w-md mx-auto">
                  Drag and drop your file here, or click the button below to browse.
                  Accepted formats: .txt (one password per line) or .csv.
                </p>
                
                <input
                  type="file"
                  id="password-file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex items-center gap-4 justify-center">
                  <label
                    htmlFor="password-file"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg inline-flex items-center cursor-pointer transition-colors"
                  >
                    <Lock size={16} className="mr-2" />
                    <span className="text-sm">Select Password File</span>
                  </label>
                  
                  {file && (
                    <div className="px-5 py-2 bg-slate-700 rounded-lg inline-flex items-center">
                      <span className="text-sm">
                        <span className="font-medium">Selected file:</span>{' '}
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg flex items-start">
                  <AlertTriangle size={20} className="text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
              
              <div className="mt-6 flex justify-center">
                <button
                  onClick={uploadFile}
                  disabled={!file || isUploading}
                  className={`px-6 py-3 rounded-lg flex items-center transition-colors ${
                    !file || isUploading
                      ? 'bg-slate-700 cursor-not-allowed text-slate-300'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <RefreshCw size={18} className="mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Shield size={18} className="mr-2" />
                      Analyze Passwords
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Bulk Analysis Results */}
          {activeTab === 'bulk' && results && (
            <BulkAnalysisResults 
              results={results} 
              onClose={resetAnalysis} 
              onDownloadReport={downloadReport} 
            />
          )}

          {/* Security Tips Card */}
          <div className="bg-slate-800 rounded-xl shadow-lg p-6 mt-8 border border-slate-700">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Shield size={18} className="text-blue-400" />
              Password Security Tips
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• Use a unique password for each of your important accounts</li>
              <li>• Use a mix of letters, numbers, and symbols</li>
              <li>• Avoid using personal information or common words</li>
              <li>• Consider using a password manager for generating and storing strong passwords</li>
              <li>• Enable two-factor authentication whenever possible</li>
            </ul>
          </div>

          <footer className="mt-10 text-center text-slate-400 text-sm">
            <p>All password analysis is performed securely on the server.</p>
            <p className="mt-1">
              Your passwords are never stored permanently and are deleted immediately after analysis.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}