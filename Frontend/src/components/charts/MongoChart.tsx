import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

declare global {
  interface Window {
    ChartsEmbedSDK: any;
  }
}

interface MongoChartProps {
  chartId: string;
  baseUrl?: string;
  title?: string;
  height?: string;
  filter?: Record<string, unknown>;
  className?: string;
}

// Load SDK script dynamically
const loadSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.ChartsEmbedSDK) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[src*="charts-embed-dom"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load MongoDB Charts SDK')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@mongodb-js/charts-embed-dom';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load MongoDB Charts SDK'));
    document.head.appendChild(script);
  });
};

export const MongoChart: React.FC<MongoChartProps> = ({
  chartId,
  baseUrl = 'https://charts.mongodb.com/charts-dev-day-lab-xqpfqxo',
  title,
  height = '400px',
  filter,
  className,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let chart: any = null;

    const renderChart = async () => {
      if (!chartContainerRef.current) return;

      try {
        await loadSDK();

        if (!mounted) return;

        const sdk = new window.ChartsEmbedSDK({
          baseUrl,
        });

        chart = sdk.createChart({
          chartId,
          height,
          theme: 'light',
          background: 'transparent',
        });

        if (filter) {
          await chart.setFilter(filter);
        }

        await chart.render(chartContainerRef.current);
        
        if (mounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to render chart:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to render chart');
          setIsLoading(false);
        }
      }
    };

    renderChart();

    return () => {
      mounted = false;
    };
  }, [chartId, baseUrl, height, filter]);

  if (error) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-destructive">
            Error: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        {isLoading && (
          <div className="p-6">
            <Skeleton className="w-full h-[400px]" />
          </div>
        )}
        <div
          ref={chartContainerRef}
          style={{ height, display: isLoading ? 'none' : 'block' }}
        />
      </CardContent>
    </Card>
  );
};
