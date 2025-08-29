
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChartDownloaderProps {
  chartData: any;
  chartType: string;
  fileName: string;
}

const ChartDownloader: React.FC<ChartDownloaderProps> = ({ 
  chartData, 
  chartType, 
  fileName 
}) => {
  const { toast } = useToast();

  const generateReportContent = () => {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    
    let content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${fileName} Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #3B82F6; padding-bottom: 20px; margin-bottom: 30px; }
          .title { color: #1F2937; font-size: 28px; font-weight: bold; margin: 0; }
          .subtitle { color: #6B7280; font-size: 14px; margin: 5px 0; }
          .section { margin: 30px 0; }
          .section-title { color: #1F2937; font-size: 20px; font-weight: bold; margin-bottom: 15px; border-left: 4px solid #3B82F6; padding-left: 15px; }
          .data-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
          .data-card { background: #F9FAFB; padding: 15px; border-radius: 8px; border: 1px solid #E5E7EB; }
          .data-label { font-weight: bold; color: #374151; font-size: 12px; text-transform: uppercase; }
          .data-value { font-size: 24px; font-weight: bold; color: #1F2937; margin-top: 5px; }
          .chart-summary { background: #EFF6FF; padding: 20px; border-radius: 8px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #E5E7EB; }
          th { background: #F3F4F6; font-weight: bold; color: #374151; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h1>
          <p class="subtitle">Generated on ${date} at ${time}</p>
        </div>
    `;

    if (chartType === 'download-history') {
      const totalDownloads = chartData.length;
      const totalSize = chartData.reduce((sum: number, item: any) => sum + parseFloat(item.fileSize || '0'), 0);
      const categories = chartData.reduce((acc: any, item: any) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      content += `
        <div class="section">
          <h2 class="section-title">Download Summary</h2>
          <div class="data-grid">
            <div class="data-card">
              <div class="data-label">Total Downloads</div>
              <div class="data-value">${totalDownloads}</div>
            </div>
            <div class="data-card">
              <div class="data-label">Total Data Size</div>
              <div class="data-value">${(totalSize !== null && totalSize !== undefined && !isNaN(Number(totalSize)) ? Number(totalSize).toFixed(1) : '0.0')} MB</div>
            </div>
            <div class="data-card">
              <div class="data-label">Average Size</div>
              <div class="data-value">${totalDownloads > 0 && totalSize !== null && totalSize !== undefined && !isNaN(Number(totalSize)) ? (Number(totalSize) / totalDownloads).toFixed(1) : '0.0'} MB</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Download Activity</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Description</th>
                <th>File Size</th>
              </tr>
            </thead>
            <tbody>
              ${chartData.slice(0, 20).map((item: any) => `
                <tr>
                  <td>${new Date(item.date).toLocaleDateString()}</td>
                  <td>${item.type}</td>
                  <td>${item.category}</td>
                  <td>${item.description}</td>
                  <td>${item.fileSize}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      // For other chart types, show the data in a structured format
      content += `
        <div class="section">
          <h2 class="section-title">Chart Data</h2>
          <div class="chart-summary">
            <p><strong>Chart Type:</strong> ${chartType}</p>
            <p><strong>Data Points:</strong> ${Array.isArray(chartData) ? chartData.length : 'N/A'}</p>
          </div>
      `;

      if (Array.isArray(chartData) && chartData.length > 0) {
        const firstItem = chartData[0];
        const headers = Object.keys(firstItem);
        
        content += `
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${chartData.slice(0, 50).map((item: any) => `
                <tr>
                  ${headers.map(header => `<td>${typeof item[header] === 'number' && item[header] !== null && item[header] !== undefined && !isNaN(Number(item[header])) ? Number(item[header]).toFixed(2) : item[header]}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
      
      content += `</div>`;
    }

    content += `
        <div class="footer">
          <p>This report was generated automatically from your analytics data.</p>
          <p>For questions or support, please contact your healthcare provider.</p>
        </div>
      </body>
      </html>
    `;

    return content;
  };

  const downloadChart = () => {
    try {
      const reportContent = generateReportContent();
      const blob = new Blob([reportContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}-report-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Downloaded",
        description: `${fileName} report has been downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download report.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={downloadChart}
      className="flex items-center gap-1"
    >
      <Download className="w-3 h-3" />
      Download
    </Button>
  );
};

export default ChartDownloader;
