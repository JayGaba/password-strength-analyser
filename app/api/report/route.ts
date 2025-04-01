// app/api/report/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { generateCSVReport } from '@/utils/passwordAnalysis';

export async function POST(request: NextRequest) {
  try {
    const { results } = await request.json();
    
    if (!results || !results.detailedResults) {
      return NextResponse.json({ error: 'No results provided' }, { status: 400 });
    }
    
    const csvContent = generateCSVReport(results);
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="password_analysis_report.csv"'
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}