// app/components/BulkAnalysisResults.tsx

import React from 'react';
import { BulkAnalysisResult } from '@/utils/passwordAnalysis';
import { AlertTriangle, Check, Download, RefreshCw, Shield, X } from 'lucide-react';

interface BulkAnalysisResultsProps {
  results: BulkAnalysisResult;
  onClose: () => void;
  onDownloadReport: () => void;
}

const BulkAnalysisResults: React.FC<BulkAnalysisResultsProps> = ({ 
  results, 
  onClose, 
  onDownloadReport
}) => {
  const getStrengthColor = (strength: number, isCompromised: boolean) => {
    if (isCompromised) return 'text-red-500';
    
    if (strength === 0) return 'text-gray-400';
    if (strength < 30) return 'text-red-600';
    if (strength < 50) return 'text-red-500';
    if (strength < 70) return 'text-orange-500';
    if (strength < 90) return 'text-yellow-400';
    return 'text-green-500';
  };
  
  const getStrengthLabel = (strength: number, timeToCrack: string) => {
    if (strength === 0) return 'Unknown';
    
    if (timeToCrack === 'Ultimate') return 'Ultimate';
    if (strength < 30) return 'Very Weak';
    if (strength < 50) return 'Weak';
    if (strength < 70) return 'Fair';
    if (strength < 90) return 'Strong';
    return 'Very Strong';
  };
  
  return (
    <div className="bg-slate-800 rounded-xl shadow-2xl p-6 border border-slate-700 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Shield className="text-blue-500" size={24} />
          Bulk Password Analysis Results
        </h3>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-slate-700 transition-colors"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <h4 className="font-medium mb-3">Summary</h4>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span className="text-slate-300">Total Passwords:</span>
              <span className="font-bold">{results.totalPasswords}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-300">Compromised Passwords:</span>
              <span className="font-bold text-red-500">{results.compromisedCount}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-300">Average Strength:</span>
              <span className="font-bold">{results.averageStrength}/100</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <h4 className="font-medium mb-3">Strength Distribution</h4>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span className="text-red-500">Weak:</span>
              <span className="font-bold">{results.weakCount}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-orange-500">Moderate:</span>
              <span className="font-bold">{results.moderateCount}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-yellow-400">Strong:</span>
              <span className="font-bold">{results.strongCount}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-green-500">Very Strong:</span>
              <span className="font-bold">{results.veryStrongCount}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-purple-500">Ultimate:</span>
              <span className="font-bold">{results.ultimateCount}</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="font-medium mb-3">Sample Results (Top 5)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left bg-slate-900">
              <tr>
                <th className="p-2 rounded-tl-lg">Password (Masked)</th>
                <th className="p-2">Strength</th>
                <th className="p-2">Time to Crack</th>
                <th className="p-2 rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.detailedResults.slice(0, 5).map((result, index) => (
                <tr key={index} className="border-t border-slate-700">
                  <td className="p-2">{result.password}</td>
                  <td className="p-2">
                    <span className={getStrengthColor(result.strength, result.isCompromised)}>
                      {getStrengthLabel(result.strength, result.timeToCrack)}
                    </span>
                  </td>
                  <td className="p-2">{result.timeToCrack}</td>
                  <td className="p-2">
                    {result.isCompromised ? (
                      <span className="flex items-center text-red-500">
                        <AlertTriangle size={16} className="mr-1" />
                        Vulnerable
                      </span>
                    ) : (
                      <span className="flex items-center text-green-500">
                        <Check size={16} className="mr-1" />
                        Secure
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={onDownloadReport}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Download size={18} className="mr-2" />
          Download Detailed Report
        </button>
      </div>
    </div>
  );
};

export default BulkAnalysisResults;