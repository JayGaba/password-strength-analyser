// app/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield, AlertTriangle, Check, X, Upload } from 'lucide-react';
import HackerSecurityAnimation from './components/HackerSecurityAnimation';

export default function PasswordStrengthAnalyzer() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [timeToCrack, setTimeToCrack] = useState('');
  const [strengthReview, setStrengthReview] = useState('');
  const [fileName, setFileName] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
    hasMinLength: false,
    hasRecommendedLength: false
  });

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
      // File processing logic would go here
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-2">Password Strength Analyzer</h1>
          </div>

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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
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
                  <li className={`flex items-start gap-2 text-sm ${/[A-Z]/.test(password) ? 'text-green-400' : 'text-slate-300'}`}>
                    <div className="min-w-6 mt-0.5">
                      {/[A-Z]/.test(password) ? <Check size={16} /> : <X size={16} className="text-slate-500" />}
                    </div>
                    <span>Contains uppercase letter</span>
                  </li>
                  <li className={`flex items-start gap-2 text-sm ${/[a-z]/.test(password) ? 'text-green-400' : 'text-slate-300'}`}>
                    <div className="min-w-6 mt-0.5">
                      {/[a-z]/.test(password) ? <Check size={16} /> : <X size={16} className="text-slate-500" />}
                    </div>
                    <span>Contains lowercase letter</span>
                  </li>
                  <li className={`flex items-start gap-2 text-sm ${/[0-9]/.test(password) ? 'text-green-400' : 'text-slate-300'}`}>
                    <div className="min-w-6 mt-0.5">
                      {/[0-9]/.test(password) ? <Check size={16} /> : <X size={16} className="text-slate-500" />}
                    </div>
                    <span>Contains number</span>
                  </li>
                  <li className={`flex items-start gap-2 text-sm ${/[^A-Za-z0-9]/.test(password) ? 'text-green-400' : 'text-slate-300'}`}>
                    <div className="min-w-6 mt-0.5">
                      {/[^A-Za-z0-9]/.test(password) ? <Check size={16} /> : <X size={16} className="text-slate-500" />}
                    </div>
                    <span>Contains special character</span>
                  </li>
                  <li className={`flex items-start gap-2 text-sm ${password.length >= 8 ? 'text-green-400' : 'text-slate-300'}`}>
                    <div className="min-w-6 mt-0.5">
                      {password.length >= 8 ? <Check size={16} /> : <X size={16} className="text-slate-500" />}
                    </div>
                    <span>At least 8 characters long</span>
                  </li>
                  <li className={`flex items-start gap-2 text-sm ${password.length >= 12 ? 'text-green-400' : 'text-slate-300'}`}>
                    <div className="min-w-6 mt-0.5">
                      {password.length >= 12 ? <Check size={16} /> : <X size={16} className="text-slate-500" />}
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

            {/* File Upload for Enterprise Feature */}
            <div className="mt-8 pt-6 border-t border-slate-700">
              <h3 className="font-medium mb-3">Enterprise Bulk Password Check</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="file-upload" className="cursor-pointer flex items-center justify-center w-full h-12 px-4 transition-colors duration-150 bg-slate-700 rounded-lg hover:bg-slate-600">
                    <Upload size={18} className="mr-2" />
                    <span>{fileName || "Upload password file"}</span>
                    <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                <button 
                  className="h-12 px-6 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors duration-150 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!fileName}
                >
                  Analyze Bulk Data
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Upload a CSV or TXT file with passwords to analyze in bulk (enterprise feature)
              </p>
            </div>
          </div>

          {/* Security Tips Card */}
          <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
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
        </div>
      </main>
    </div>
  );
}