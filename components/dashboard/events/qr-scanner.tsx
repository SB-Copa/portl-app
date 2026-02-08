'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CameraOff, Search, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const Scanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then((mod) => mod.Scanner),
  { ssr: false }
);

interface CheckInResult {
  success: boolean;
  message: string;
  attendeeName?: string;
  ticketType?: string;
}

interface QrScannerProps {
  onCheckIn: (ticketCode: string) => Promise<CheckInResult>;
  compact?: boolean;
}

export function QrScanner({ onCheckIn, compact = false }: QrScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);

  const handleCheckIn = useCallback(
    async (code: string) => {
      if (loading || !code.trim()) return;
      setLoading(true);
      setPaused(true);
      try {
        const result = await onCheckIn(code.trim());
        setLastResult(result);
        if (result.success) {
          setManualCode('');
        }
      } catch {
        setLastResult({ success: false, message: 'An unexpected error occurred' });
      } finally {
        setLoading(false);
        setTimeout(() => setPaused(false), 2000);
      }
    },
    [loading, onCheckIn]
  );

  const handleScan = useCallback(
    (result: { rawValue: string }[]) => {
      if (result?.[0]?.rawValue && !paused && !loading) {
        handleCheckIn(result[0].rawValue);
      }
    },
    [paused, loading, handleCheckIn]
  );

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCheckIn(manualCode);
  };

  if (compact) {
    return (
      <div className="space-y-3">
        {scanning && (
          <div className="relative aspect-square max-h-48 overflow-hidden rounded-lg bg-black">
            <Scanner
              onScan={handleScan}
              paused={paused}
              allowMultiple
              scanDelay={1500}
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant={scanning ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setScanning(!scanning)}
          >
            {scanning ? (
              <CameraOff className="h-4 w-4 mr-1" />
            ) : (
              <Camera className="h-4 w-4 mr-1" />
            )}
            {scanning ? 'Stop' : 'Scan'}
          </Button>
          <form onSubmit={handleManualSubmit} className="flex gap-2 flex-1">
            <Input
              placeholder="TKT-XXXX-XXXX"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="font-mono text-xs h-9"
            />
            <Button type="submit" size="sm" disabled={loading || !manualCode.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>
        </div>

        {lastResult && (
          <div
            className={`flex items-center gap-2 text-sm p-2 rounded-md ${
              lastResult.success
                ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
            }`}
          >
            {lastResult.success ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate">{lastResult.message}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>QR Check-in Scanner</span>
          <Button
            variant={scanning ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setScanning(!scanning)}
          >
            {scanning ? (
              <>
                <CameraOff className="h-4 w-4 mr-1" />
                Stop Camera
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-1" />
                Start Camera
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scanning && (
          <div className="relative aspect-video max-h-64 overflow-hidden rounded-lg bg-black">
            <Scanner
              onScan={handleScan}
              paused={paused}
              allowMultiple
              scanDelay={1500}
            />
          </div>
        )}

        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <Input
            placeholder="Enter ticket code manually (TKT-XXXX-XXXX)"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="font-mono"
          />
          <Button type="submit" disabled={loading || !manualCode.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Search className="h-4 w-4 mr-1" />
            )}
            Check In
          </Button>
        </form>

        {lastResult && (
          <div
            className={`flex items-center gap-2 p-3 rounded-md ${
              lastResult.success
                ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
            }`}
          >
            {lastResult.success ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0" />
            )}
            <div>
              <p className="font-medium">{lastResult.message}</p>
              {lastResult.attendeeName && (
                <p className="text-sm opacity-80">
                  {lastResult.attendeeName} - {lastResult.ticketType}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
