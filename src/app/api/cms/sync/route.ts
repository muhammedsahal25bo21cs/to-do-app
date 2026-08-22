import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'published_cms_data.json');

function readStoredData() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading published_cms_data.json:', err);
  }
  return null;
}

function writeStoredData(data: any) {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing published_cms_data.json:', err);
    return false;
  }
}

export async function GET() {
  const data = readStoredData();
  return NextResponse.json(data || {});
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = readStoredData() || {};

    const updated = {
      ...current,
      ...body,
      last_synced_at: new Date().toISOString(),
    };

    const success = writeStoredData(updated);
    if (success) {
      return NextResponse.json({ success: true, timestamp: updated.last_synced_at });
    } else {
      return NextResponse.json({ success: false, error: 'Failed to write data file' }, { status: 500 });
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}
