import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'SMMRY: AI Article Summarizer';
  const type = searchParams.get('type') || 'default';

  let subtitle = 'Summarize any article in seconds';
  
  if (type === 'summarize') {
    subtitle = 'Free AI-powered article summarizer tool';
  } else if (type === 'guide') {
    subtitle = 'Learn how to create perfect article summaries';
  } else if (type === 'history') {
    subtitle = 'View and manage your summarization history';
  } else if (type === 'settings') {
    subtitle = 'Manage your account settings and preferences';
  } else if (type === 'shared') {
    subtitle = 'View a shared article summary';
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          fontSize: 60,
          color: 'white',
          background: 'linear-gradient(to bottom right, #3b82f6, #1e40af)',
          width: '100%',
          height: '100%',
          textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          padding: '40px',
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 'bold', marginBottom: '20px' }}>
          {title}
        </div>
        <div style={{ fontSize: 40, opacity: 0.8 }}>
          {subtitle}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
} 