// utils/passwordAnalysis.ts

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createReadStream, writeFileSync } from 'fs';

export interface PasswordCheckResult {
  password: string;
  strength: number;
  timeToCrack: string;
  isCompromised: boolean;
  feedback: string[];
}

export interface BulkAnalysisResult {
  totalPasswords: number;
  compromisedCount: number;
  weakCount: number;
  moderateCount: number;
  strongCount: number;
  veryStrongCount: number;
  ultimateCount: number;
  averageStrength: number;
  detailedResults: PasswordCheckResult[];
}

// Calculate password strength with the same algorithm used in the main component
export const calculateStrength = (pwd: string) => {
  if (!pwd) return { 
    score: 0, 
    feedback: [], 
    time: '', 
    review: '', 
    isCompromised: false,
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
  let isCompromised = false;
  
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
    isCompromised = true;
  } else if (score < 50) {
    time = 'Seconds';
    review = 'This password is very vulnerable. Any basic hacking attempt would break it.';
    isCompromised = true;
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
  
  return { score, feedback, time, review, isCompromised, requirements };
};

// Check if the password exists in common password lists (like rockyou.txt)
export const checkIfPasswordCompromised = async (password: string): Promise<boolean> => {
  try {
    // This is a simplified version. In a real implementation, you would:
    // 1. Generate a hash of the password
    // 2. Compare against known breached password databases
    // 3. Use k-anonymity to protect the password itself from being exposed
    
    // For demo purposes, we'll check against an array of common passwords
    const commonPasswords = [
      'password', '123456', 'qwerty', 'admin', 'welcome',
      'password123', 'abc123', 'letmein', '123456789', '12345',
      'monkey', '1234567', 'sunshine', 'iloveyou', 'trustno1'
    ];
    
    return commonPasswords.includes(password.toLowerCase());
  } catch (error) {
    console.error('Error checking if password is compromised:', error);
    return false;
  }
};

// Process the uploaded file with passwords
export const processPasswordFile = async (filePath: string): Promise<BulkAnalysisResult> => {
  const results: PasswordCheckResult[] = [];
  const fileExtension = path.extname(filePath).toLowerCase();
  
  try {
    // Process based on file extension
    if (fileExtension === '.csv') {
      // Process CSV file
      await new Promise<void>((resolve, reject) => {
        createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            // Extract password from the row (assuming the column is named 'password')
            const password = row.password || Object.values(row)[0];
            if (password) {
              processPassword(password, results);
            }
          })
          .on('end', () => {
            resolve();
          })
          .on('error', (error) => {
            reject(error);
          });
      });
    } else if (fileExtension === '.txt') {
      // Process TXT file (one password per line)
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const passwords = fileContent.split(/\r?\n/).filter(line => line.trim());
      
      for (const password of passwords) {
        await processPassword(password, results);
      }
    }
    
    // Clean up the temporary file
    fs.unlinkSync(filePath);
    
    // Generate summary statistics
    return generateSummary(results);
  } catch (error) {
    console.error('Error processing password file:', error);
    // Clean up the file in case of error
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupError) {
      console.error('Error cleaning up file:', cleanupError);
    }
    
    throw new Error('Failed to process password file');
  }
};

// Process individual password
async function processPassword(password: string, results: PasswordCheckResult[]) {
  const strengthResult = calculateStrength(password);
  const isCompromised = await checkIfPasswordCompromised(password);
  
  results.push({
    password: password.substring(0, 3) + '•'.repeat(password.length - 3), // Mask the password for security
    strength: strengthResult.score,
    timeToCrack: strengthResult.time,
    isCompromised: isCompromised || strengthResult.isCompromised,
    feedback: strengthResult.feedback
  });
}

// Generate summary statistics
function generateSummary(results: PasswordCheckResult[]): BulkAnalysisResult {
  const totalPasswords = results.length;
  let compromisedCount = 0;
  let weakCount = 0;
  let moderateCount = 0;
  let strongCount = 0;
  let veryStrongCount = 0;
  let ultimateCount = 0;
  let strengthSum = 0;
  
  for (const result of results) {
    if (result.isCompromised) {
      compromisedCount++;
    }
    
    strengthSum += result.strength;
    
    if (result.timeToCrack === 'Ultimate') {
      ultimateCount++;
    } else if (result.strength < 30) {
      weakCount++;
    } else if (result.strength < 50) {
      weakCount++;
    } else if (result.strength < 70) {
      moderateCount++;
    } else if (result.strength < 90) {
      strongCount++;
    } else {
      veryStrongCount++;
    }
  }
  
  return {
    totalPasswords,
    compromisedCount,
    weakCount,
    moderateCount,
    strongCount,
    veryStrongCount,
    ultimateCount,
    averageStrength: totalPasswords > 0 ? Math.round(strengthSum / totalPasswords) : 0,
    detailedResults: results
  };
}

// Generate a CSV report for download
export const generateCSVReport = (results: BulkAnalysisResult): string => {
  const rows = [
    // Header row
    ['Password (Masked)', 'Strength Score', 'Time to Crack', 'Compromised', 'Feedback'].join(','),
    // Data rows
    ...results.detailedResults.map(result => [
      `"${result.password}"`,
      result.strength,
      `"${result.timeToCrack}"`,
      result.isCompromised ? 'Yes' : 'No',
      `"${result.feedback.join('; ')}"`
    ].join(','))
  ];
  
  return rows.join('\n');
};