import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Copy, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface WebhookLog {
  id: string;
  event_type: string;
  event_id: string;
  payload: any;
  signature_verified: boolean;
  created_at: string;
}

export default function TestWebhooks() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<WebhookLog[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [webhookUrl] = useState('https://xphaqwuqfirixskqjhjr.supabase.co/functions/v1/stripe-webhooks');

  const checkDatabaseConnection = async () => {
    setTesting(true);
    try {
      // Try to query the webhook_logs table directly
      const { data, error, count } = await supabase
        .from('webhook_logs')
        .select('*', { count: 'exact', head: false })
        .limit(1);
      
      if (error) {
        toast.error(`Database error: ${error.message}`);
        console.error('Database error:', error);
      } else {
        toast.success(`Database connected! Found ${count || 0} total webhook logs.`);
        console.log('Sample log:', data?.[0]);
      }
    } catch (error) {
      toast.error('Failed to query database');
      console.error(error);
    } finally {
      setTesting(false);
      fetchLogs();
    }
  };




  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      toast.error('Failed to fetch webhook logs');
      console.error(error);
    } else {
      setLogs(data || []);
      applyFilter(data || [], filter);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('webhook_logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'webhook_logs' }, (payload) => {
        setLogs((prev) => [payload.new as WebhookLog, ...prev]);
        toast.success(`New webhook: ${(payload.new as WebhookLog).event_type}`);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    applyFilter(logs, filter);
  }, [logs, filter]);

  const applyFilter = (logList: WebhookLog[], filterType: string) => {
    if (filterType === 'all') {
      setFilteredLogs(logList);
    } else if (filterType === 'verified') {
      setFilteredLogs(logList.filter(log => log.signature_verified));
    } else if (filterType === 'failed') {
      setFilteredLogs(logList.filter(log => !log.signature_verified));
    } else {
      setFilteredLogs(logList.filter(log => log.event_type === filterType));
    }
  };

  const clearLogs = async () => {
    const { error } = await supabase.from('webhook_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      toast.error('Failed to clear logs');
    } else {
      setLogs([]);
      toast.success('Logs cleared');
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success('Webhook URL copied to clipboard');
  };

  const eventTypes = Array.from(new Set(logs.map(log => log.event_type)));

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Webhook Testing Dashboard</h1>
        <p className="text-muted-foreground">Monitor and test Stripe webhook events in real-time</p>
      </div>

      <Card className="mb-6 border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-900">🔍 Troubleshooting: Not seeing webhook events?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold mb-1">If Stripe shows 200 responses but no logs appear:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Check if the webhook URL in Stripe matches exactly: <code className="bg-yellow-100 px-1 rounded">{webhookUrl}</code></li>
              <li>Verify the webhook signing secret is correctly set in Supabase Edge Function secrets</li>
              <li>Click "Check Database" below to verify the connection is working</li>
              <li>Check Supabase Edge Function logs for any errors during webhook processing</li>
              <li>Try sending a test webhook from Stripe Dashboard (Developers → Webhooks → Send test webhook)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 mb-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Webhook Endpoint</CardTitle>
            <CardDescription>Your Stripe webhook URL - use this EXACT URL in Stripe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-muted rounded text-sm overflow-x-auto">{webhookUrl}</code>
              <Button size="icon" variant="outline" onClick={copyUrl}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              ✓ This is the correct URL format (uses function name, not ID)
            </p>
            <Button 
              onClick={checkDatabaseConnection} 
              disabled={testing}
              className="w-full"
              variant="secondary"
            >
              {testing ? 'Checking...' : 'Check Database Connection'}
            </Button>
            <p className="text-xs text-muted-foreground">
              Verify that the app can read from the webhook_logs table
            </p>
          </CardContent>
        </Card>





        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Webhook event summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Total Events:</span>
              <Badge>{logs.length}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Verified:</span>
              <Badge variant="default">{logs.filter(l => l.signature_verified).length}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Failed:</span>
              <Badge variant="destructive">{logs.filter(l => !l.signature_verified).length}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Webhook Events</CardTitle>
              <CardDescription>Real-time webhook event log</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchLogs}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="destructive" size="sm" onClick={clearLogs}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="verified">Verified Only</SelectItem>
                <SelectItem value="failed">Failed Only</SelectItem>
                {eventTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[600px] border rounded-lg">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No webhook events yet</div>
            ) : (
              <div className="space-y-4 p-4">
                {filteredLogs.map((log) => (
                  <Card key={log.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{log.event_type}</CardTitle>
                            {log.signature_verified ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <CardDescription className="text-xs">
                            {new Date(log.created_at).toLocaleString()}
                          </CardDescription>
                        </div>
                        <Badge variant={log.signature_verified ? 'default' : 'destructive'}>
                          {log.signature_verified ? 'Verified' : 'Failed'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs">
                        <p className="mb-2 font-semibold">Event ID: {log.event_id}</p>
                        <pre className="bg-muted p-3 rounded overflow-x-auto max-h-[200px]">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
