// app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { processPasswordFile } from '@/utils/passwordAnalysis';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';
import os from 'os';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.txt')) {
      return NextResponse.json({ error: 'Only CSV and TXT files are allowed' }, { status: 400 });
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }
    
    // Generate a secure temporary file path
    const tempDir = os.tmpdir();
    const randomName = crypto.randomBytes(16).toString('hex');
    const extension = fileName.endsWith('.csv') ? '.csv' : '.txt';
    const filePath = join(tempDir, `${randomName}${extension}`);
    
    // Save the file temporarily
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    
    // Process the file and get results
    const results = await processPasswordFile(filePath);
    
    return NextResponse.json({ success: true, results }, { status: 200 });
  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json({ error: 'Failed to process file upload' }, { status: 500 });
  }
}

export async function OPTIONS() {
  // Handle preflight requests
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}