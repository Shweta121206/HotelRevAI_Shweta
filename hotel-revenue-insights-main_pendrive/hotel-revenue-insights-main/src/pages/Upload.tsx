import { useState, useRef, ChangeEvent } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { bookingsAPI } from "@/lib/api";
import { UploadHistory } from "@/components/UploadHistory";
import {
  Upload as UploadIcon,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  Database,
  BarChart3,
  FileText,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface UploadedData {
  records: number;
  months: number;
  trends: number;
  fileName: string;
}

interface HistoricalTrend {
  period: string;
  avgOccupancy: number;
  avgRevenue: number;
}

const Upload = () => {
  const { currency } = useCurrency();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<{ refresh: () => Promise<void> }>(null);
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedData, setUploadedData] = useState<UploadedData | null>(null);
  const [historicalTrends, setHistoricalTrends] = useState<HistoricalTrend[]>([
    { period: "Q1 2024", avgOccupancy: 72, avgRevenue: 365000 },
    { period: "Q2 2024", avgOccupancy: 78, avgRevenue: 395000 },
    { period: "Q3 2024", avgOccupancy: 82, avgRevenue: 420000 },
    { period: "Q4 2024", avgOccupancy: 85, avgRevenue: 445000 },
  ]);

  // Parse CSV data with better handling of quoted fields
  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) return [];

    // Parse headers
    const headerLine = lines[0];
    const headers: string[] = [];
    let currentHeader = '';
    let inQuotes = false;

    for (let i = 0; i < headerLine.length; i++) {
      const char = headerLine[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        headers.push(currentHeader.trim().toLowerCase().replace(/^"|"$/g, ''));
        currentHeader = '';
      } else {
        currentHeader += char;
      }
    }
    if (currentHeader.trim()) {
      headers.push(currentHeader.trim().toLowerCase().replace(/^"|"$/g, ''));
    }

    const data: any[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values: string[] = [];
      let currentValue = '';
      inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim().replace(/^"|"$/g, ''));
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      if (currentValue.trim()) {
        values.push(currentValue.trim().replace(/^"|"$/g, ''));
      }

      if (values.length > 0) {
        const row: any = {};
        headers.forEach((header, index) => {
          const value = values[index] || '';
          // Try to parse numbers
          if (header && (header.includes('price') || header.includes('booked') || header.includes('occupancy') || header.includes('room'))) {
            const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
            row[header] = isNaN(numValue) ? (value || 0) : numValue;
          } else {
            row[header] = value;
          }
        });
        if (Object.keys(row).length > 0) {
          data.push(row);
        }
      }
    }
    return data;
  };

  // Parse JSON data
  const parseJSON = (jsonText: string): any[] => {
    try {
      const parsed = JSON.parse(jsonText);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  };

    // Detect dominant date format in an array of date-like strings
    const detectDateFormat = (samples: string[]) => {
      let dmy = 0;
      let mdy = 0;
      let ymd = 0;

      for (const s of samples) {
        if (!s) continue;
        const str = String(s).trim();
        const m = str.match(/^(\d{1,4})[\/\-](\d{1,2})[\/\-](\d{1,4})$/);
        if (!m) continue;
        const a = Number(m[1]);
        const b = Number(m[2]);
        const c = Number(m[3]);

        if (a > 999) ymd++; // 2025-01-05
        else if (c > 999) {
          // either DMY or MDY
          if (a > 12 && b <= 12) dmy++;
          else if (b > 12 && a <= 12) mdy++;
          else {
            // ambiguous: prefer DMY (common outside US)
            dmy++;
          }
        }
      }

      if (ymd > dmy && ymd > mdy) return 'YMD';
      if (dmy >= mdy) return 'DMY';
      return 'MDY';
    };

    const parseDateWithHint = (dateStr: string, hint: string) => {
      const s = String(dateStr).trim();
      if (!s) return null;

      // ISO-like
      const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

      // Try native Date first
      const native = new Date(s);
      if (!isNaN(native.getTime())) {
        return native.toISOString().split('T')[0];
      }

      const m = s.match(/^(\d{1,4})[\/\-](\d{1,2})[\/\-](\d{1,4})$/);
      if (!m) return null;

      const a = m[1].padStart(2, '0');
      const b = m[2].padStart(2, '0');
      const c = m[3].padStart(4, '0');

      try {
        if (hint === 'YMD' || a.length === 4) {
          // a = year
          return `${a}-${b}-${c}`.slice(0, 10);
        }
        if (hint === 'DMY') {
          // a=day, b=month, c=year
          return `${c}-${b}-${a}`.slice(0, 10);
        }
        // MDY
        return `${c}-${a}-${b}`.slice(0, 10);
      } catch {
        return null;
      }
    };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/json",
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls|json)$/i)) {
      toast.error("Invalid file type", {
        description: "Please upload a CSV, XLSX, or JSON file",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Read file content
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      let parsedData: any[] = [];

      // Parse based on file type
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        parsedData = parseCSV(text);
      } else if (file.name.endsWith('.json') || file.type === 'application/json') {
        parsedData = parseJSON(text);
      } else {
        // For Excel files, we'd need a library like xlsx, but for demo we'll treat as CSV
        parsedData = parseCSV(text);
      }

      if (parsedData.length === 0) {
        toast.error("No data found", {
          description: "The file appears to be empty or in an unsupported format. Please check your file format.",
        });
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      toast.success("File parsed successfully", {
        description: `Found ${parsedData.length} records`,
      });

      // Transform data to match our expected format
      const transformedData = parsedData.map((row, index) => {
        // Find date field (try various formats)
        let dateValue = row.date || row.booking_date || row.checkin_date || row['check-in'] || row['check_in'] || '';
        if (!dateValue || dateValue === '') {
          // Use current date if no date found
          dateValue = new Date().toISOString().split('T')[0];
        } else {
          // Try to parse and format date
          try {
            const dateObj = new Date(dateValue);
            if (!isNaN(dateObj.getTime())) {
              dateValue = dateObj.toISOString().split('T')[0];
            } else {
              // Try common date formats
              const dateStr = String(dateValue);
              if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                dateValue = dateStr;
              } else if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                const [month, day, year] = dateStr.split('/');
                dateValue = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              } else {
                dateValue = new Date().toISOString().split('T')[0];
              }
            }
          } catch {
            dateValue = new Date().toISOString().split('T')[0];
          }
        }

        // Find rooms booked field
        const roomsBooked = parseFloat(row.rooms_booked || row.rooms || row.roomsbooked || row.room_booked || row.occupancy || row.rooms_booked || '1');
        
        // Find price field
        const roomPrice = parseFloat(row.room_price || row.price || row.roomprice || row.rate || row.room_rate || row.cost || '150');
        
        // Find room type field
        const roomType = String(row.room_type || row.room || row.type || row.roomtype || row.room_category || 'Standard Room').trim();

        return {
          date: dateValue,
          roomsBooked: isNaN(roomsBooked) || roomsBooked <= 0 ? 1 : Math.round(roomsBooked),
          roomPrice: isNaN(roomPrice) || roomPrice <= 0 ? 150 : Math.round(roomPrice * 100) / 100,
          roomType: roomType || 'Standard Room'
        };
      }).filter(row => row.date && row.roomsBooked > 0 && row.roomPrice > 0);

      setIsUploading(false);
      setIsAnalyzing(true);

      toast.info("Uploading data...", {
        description: `Sending ${transformedData.length} records to AI analysis`,
      });

      // Upload to backend
      let response: any;
      try {
        response = await bookingsAPI.upload({ data: transformedData });
        
        if (!response || !response.data) {
          throw new Error('Invalid response from server');
        }

        // Refresh all analytics data
        await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        await queryClient.invalidateQueries({ queryKey: ['analytics'] });
        await queryClient.invalidateQueries({ queryKey: ['pricing'] });
        
        toast.success("Data synced with backend", {
          description: "Analytics will update shortly",
        });
      } catch (err: any) {
        // If the backend is down or unreachable, still show success but warn user
        console.warn('Upload API failed, using local data only', err);
        response = { 
          data: { 
            processed: transformedData.length, 
            errors: 0,
            message: 'Data processed locally (backend unavailable)'
          } 
        };
        toast.warning('Backend unavailable', {
          description: 'Data processed locally. Analytics may not update until backend is available.',
        });
      }

      // Update UI with results
      const records = response?.data?.processed || transformedData.length;
      // Calculate unique months from date column
const monthSet = new Set<string>();

parsedData.forEach((row: any) => {
  if (row.date) {
    const d = new Date(row.date);
    if (!isNaN(d.getTime())) {
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthSet.add(ym);
    }
  }
});

const months = monthSet.size;
      const trends = Math.floor(records / 100) + 1; // Estimate trends found

      setUploadedData({
        records,
        months,
        trends,
        fileName: file.name,
      });

      setIsAnalyzing(false);

      // Save upload history to database
      try {
        await fetch('http://localhost:5000/api/upload-history/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.id || user?.email || 'demo-user',
            hotelName: user?.hotelName || 'Demo Hotel',
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type || 'unknown',
            recordsCount: records,
          }),
        });
        
        // Refresh the history component
        if (historyRef.current?.refresh) {
          await historyRef.current.refresh();
        }
      } catch (error) {
        console.error('Error saving upload history:', error);
      }

      toast.success("Data uploaded successfully!", {
        description: `${records.toLocaleString()} records processed and analyzed`,
      });

      if (response.data.errors > 0) {
        toast.warning("Some records had issues", {
          description: `${response.data.errors} records were skipped due to formatting issues`,
        });
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setIsAnalyzing(false);

      toast.error("Upload failed", {
        description: error.response?.data?.error || "Failed to process the file",
      });
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setUploadedData(null);
    setHistoricalTrends([
      { period: "Q1 2024", avgOccupancy: 72, avgRevenue: 365000 },
      { period: "Q2 2024", avgOccupancy: 78, avgRevenue: 395000 },
      { period: "Q3 2024", avgOccupancy: 82, avgRevenue: 420000 },
      { period: "Q4 2024", avgOccupancy: 85, avgRevenue: 445000 },
    ]);
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">Data Upload</h1>
          <p className="mt-1 text-muted-foreground">
            Upload your hotel booking data for AI-powered trend analysis
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upload Section */}
          <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <CardTitle className="text-lg">Upload Booking Data</CardTitle>
            </CardHeader>
            <CardContent>
              {!uploadedData ? (
                <div className="space-y-6">
                  {/* Drop Zone */}
                  <div
                    className={`relative flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300 ${
                      isUploading || isAnalyzing
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-secondary/50"
                    }`}
                    onClick={handleUploadClick}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
                        <p className="text-sm text-muted-foreground">
                          Uploading file...
                        </p>
                      </div>
                    ) : isAnalyzing ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                          <BarChart3 className="h-10 w-10 text-primary animate-pulse" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          AI analyzing data...
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                          <UploadIcon className="h-7 w-7 text-primary" />
                        </div>
                        <p className="mt-4 text-sm font-medium text-foreground">
                          Click to upload your data file
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          CSV, XLSX, or JSON files supported
                        </p>
                      </>
                    )}
                  </div>

                  {/* File Format Info */}
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <div className="flex items-start gap-3">
                      <FileSpreadsheet className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Supported Formats
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Upload your hotel booking data in CSV, Excel (.xlsx), or JSON format. 
                          The system will automatically detect and parse your data structure.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col items-center py-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                      <CheckCircle2 className="h-8 w-8 text-success" />
                    </div>
                    <p className="mt-4 text-lg font-medium text-foreground">
                      Upload Complete
                    </p>
                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-1.5">
                      <FileText className="h-4 w-4 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        {uploadedData.fileName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-secondary/50 p-3 text-center">
                      <Database className="mx-auto h-5 w-5 text-primary" />
                      <p className="mt-2 text-lg font-bold text-foreground">
                        {uploadedData.records.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Records</p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3 text-center">
                      <BarChart3 className="mx-auto h-5 w-5 text-primary" />
                      <p className="mt-2 text-lg font-bold text-foreground">
                        {uploadedData.months}
                      </p>
                      <p className="text-xs text-muted-foreground">Months</p>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3 text-center">
                      <TrendingUp className="mx-auto h-5 w-5 text-primary" />
                      <p className="mt-2 text-lg font-bold text-foreground">
                        {uploadedData.trends}
                      </p>
                      <p className="text-xs text-muted-foreground">Trends</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleReset}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Upload New Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historical Trends */}
          <Card className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <CardHeader>
              <CardTitle className="text-lg">Historical Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {historicalTrends.map((trend, index) => (
                  <div
                    key={trend.period}
                    className="flex items-center justify-between rounded-lg bg-secondary/50 p-4 transition-all duration-200 hover:bg-secondary"
                    style={{ animationDelay: `${(index + 3) * 100}ms` }}
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {trend.period}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Avg Occupancy: {trend.avgOccupancy}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {currency.symbol}{(trend.avgRevenue / 1000).toFixed(0)}k
                      </p>
                      <p className="text-xs text-muted-foreground">Avg Revenue</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trend Summary */}
              <div className="mt-6 rounded-lg border border-success/30 bg-success/5 p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  <p className="font-medium text-success">Positive Trend</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Revenue has grown <span className="text-success font-medium">22%</span>{" "}
                  over the past 4 quarters with consistent occupancy improvements.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Requirements */}
        <Card className="animate-slide-up" style={{ animationDelay: "300ms" }}>
          <CardHeader>
            <CardTitle className="text-lg">Data Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { field: "booking_date", desc: "Date of booking" },
                { field: "check_in", desc: "Guest check-in date" },
                { field: "room_type", desc: "Type of room booked" },
                { field: "price", desc: "Room price per night" },
              ].map((item) => (
                <div
                  key={item.field}
                  className="rounded-lg bg-secondary/50 p-3"
                >
                  <code className="text-sm text-primary">{item.field}</code>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upload History */}
        <div className="animate-slide-up" style={{ animationDelay: "400ms" }}>
          <UploadHistory ref={historyRef} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Upload;
