import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Bell, Calendar, Mail, Send } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";

export default function EMSDashboard() {
  const [stats, setStats] = useState({
    totalScheduled: 0,
    sentToday: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/ems/stats');
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching EMS stats:', error);
    }
  };

  const handleSendTaskReminders = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const response = await api.post('/ems/send-task-reminders', {
        reminderType: "due_soon"
      });

      if (response.success) {
        setSuccess("Task reminders sent successfully!");
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      setError(error.message || "Failed to send task reminders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">EMS Dashboard</h1>
          <p className="text-muted-foreground">
            Manage automated email notifications and communications
          </p>
        </div>
        <Button
          onClick={handleSendTaskReminders}
          disabled={loading}
          className="bg-primary hover:bg-primary/90"
        >
          <Send className="h-4 w-4 mr-2" />
          Send Task Reminders
        </Button>
      </div>

      {success && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
          <Bell className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900">
          <Bell className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Emails</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScheduled}</div>
            <p className="text-xs text-muted-foreground">
              Total emails scheduled for delivery
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sentToday}</div>
            <p className="text-xs text-muted-foreground">
              Emails sent in the last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Delivery</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Emails queued for sending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Email Templates Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            Manage and customize email templates for different notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add template management UI here */}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Emails Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Scheduled Emails</CardTitle>
          <CardDescription>
            View and manage upcoming scheduled email communications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add scheduled emails list/management UI here */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}