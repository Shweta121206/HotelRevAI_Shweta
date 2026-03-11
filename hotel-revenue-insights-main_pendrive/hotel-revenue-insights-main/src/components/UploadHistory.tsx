import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileUp, Calendar, Database, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";

interface UploadRecord {
  id: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  recordsCount: number;
  uploadDate: string;
  status: string;
}

export const UploadHistory = forwardRef<{ refresh: () => Promise<void> }>(
  function UploadHistory(_, ref) {
    const { user } = useAuth();
    const [history, setHistory] = useState<UploadRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
      totalUploads: 0,
      totalRecords: 0,
      totalFileSize: 0,
    });

  useEffect(() => {
    if (user?.id || user?.email) {
      fetchUploadHistory();
      fetchStats();
    }
  }, [user?.id, user?.email]);

  useImperativeHandle(ref, () => ({
    refresh: refreshHistory,
  }));

  const fetchUploadHistory = async () => {
    try {
      const userId = user?.id || user?.email;
      if (!userId) {
        console.warn('No user ID or email available');
        setLoading(false);
        return;
      }
      const response = await fetch(
        `http://localhost:5000/api/upload-history/user/${userId}`
      );
      const data = await response.json();
      console.log('Upload history response:', data);
      if (data.success) {
        setHistory(data.data || []);
      } else {
        console.error('Failed to fetch history:', data.error);
      }
    } catch (error) {
      console.error("Error fetching upload history:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const userId = user?.id || user?.email;
      if (!userId) return;
      const response = await fetch(
        `http://localhost:5000/api/upload-history/stats?userId=${userId}`
      );
      const data = await response.json();
      if (data.success && data.data) {
        setStats({
          totalUploads: data.data.totalUploads || 0,
          totalRecords: data.data.totalRecords || 0,
          totalFileSize: data.data.totalFileSize || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const refreshHistory = async () => {
    setRefreshing(true);
    await fetchUploadHistory();
    await fetchStats();
    setRefreshing(false);
  };

  const handleDelete = async (recordId: number, fileName: string) => {
    try {
      const userId = user?.id || user?.email;
      if (!userId) return;

      const response = await fetch(
        `http://localhost:5000/api/upload-history/${recordId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success('Upload deleted', {
          description: `${fileName} has been removed from history`,
        });
        await refreshHistory();
      } else {
        toast.error('Failed to delete', {
          description: data.error || 'Could not delete the upload record',
        });
      }
    } catch (error) {
      console.error('Error deleting upload history:', error);
      toast.error('Error', {
        description: 'Failed to delete the upload record',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Uploads
              </CardTitle>
              <FileUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.totalUploads}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Records
              </CardTitle>
              <Database className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.totalRecords?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total File Size
              </CardTitle>
              <FileUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatFileSize(stats.totalFileSize || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload History Table */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upload History
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshHistory}
              disabled={refreshing}
              className="gap-2"
            >
              <RotateCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileUp className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No upload history yet</p>
              <p className="text-sm text-muted-foreground/60">
                Upload your first file to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-foreground">File Name</TableHead>
                    <TableHead className="text-foreground">File Type</TableHead>
                    <TableHead className="text-foreground">File Size</TableHead>
                    <TableHead className="text-foreground">Records</TableHead>
                    <TableHead className="text-foreground">Upload Date</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((record) => (
                    <TableRow
                      key={record.id}
                      className="border-border/30 hover:bg-muted/30"
                    >
                      <TableCell className="text-foreground font-medium">
                        {record.fileName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.fileType}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatFileSize(record.fileSize)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.recordsCount?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(
                          new Date(record.uploadDate),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.status === "success" ? "default" : "secondary"
                          }
                          className="capitalize"
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(record.id, record.fileName)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
  }
);
