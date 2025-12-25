import { useState } from "react";
import { BarChart3, TrendingUp, TrendingDown, Eye, MousePointer, Heart, Linkedin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

// Mock analytics data
const overviewMetrics = [
  { title: 'Total Views', value: '12.5K', icon: Eye, trend: { value: 23, direction: 'up' as const } },
  { title: 'Engagements', value: '1,847', icon: Heart, trend: { value: 12, direction: 'up' as const } },
  { title: 'Click-through Rate', value: '4.2%', icon: MousePointer, trend: { value: 0.5, direction: 'up' as const } },
  { title: 'Posts Published', value: '28', icon: BarChart3, trend: { value: 8, direction: 'up' as const } },
];

const chartData = [
  { name: 'Mon', views: 1200, engagements: 180 },
  { name: 'Tue', views: 1800, engagements: 220 },
  { name: 'Wed', views: 1400, engagements: 190 },
  { name: 'Thu', views: 2200, engagements: 310 },
  { name: 'Fri', views: 1900, engagements: 280 },
  { name: 'Sat', views: 1100, engagements: 150 },
  { name: 'Sun', views: 900, engagements: 120 },
];

const contentTypeData = [
  { name: 'Blogs', value: 65 },
  { name: 'Images', value: 35 },
];

const topContent = [
  { id: '1', title: 'AI Trends 2025', type: 'blog', platform: 'LinkedIn', views: 3240, engagement: 12.5, clicks: 187 },
  { id: '2', title: 'Product Launch Announcement', type: 'blog', platform: 'LinkedIn', views: 2890, engagement: 10.2, clicks: 156 },
  { id: '3', title: 'Team Photo', type: 'image', platform: 'LinkedIn', views: 2100, engagement: 15.8, clicks: 89 },
  { id: '4', title: 'Industry Report Summary', type: 'blog', platform: 'LinkedIn', views: 1850, engagement: 8.4, clicks: 112 },
  { id: '5', title: 'Behind the Scenes', type: 'image', platform: 'LinkedIn', views: 1420, engagement: 18.2, clicks: 67 },
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your content performance
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewMetrics.map((metric) => (
          <StatCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            trend={metric.trend}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Over Time</CardTitle>
            <CardDescription>Views and engagements trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="engagements" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--accent))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Content Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Type Performance</CardTitle>
            <CardDescription>Engagement by content type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contentTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" className="text-xs" width={60} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Linkedin className="h-5 w-5" />
            LinkedIn Overview
          </CardTitle>
          <CardDescription>Performance on connected platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Followers</p>
              <p className="text-2xl font-bold">2,847</p>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> +127 this month
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Impressions</p>
              <p className="text-2xl font-bold">45.2K</p>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> +18% vs last period
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Profile Views</p>
              <p className="text-2xl font-bold">892</p>
              <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <TrendingDown className="h-3 w-3" /> -5% vs last period
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Content Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Performing Content</CardTitle>
          <CardDescription>Your best content this period</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Engagement %</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topContent.map((content) => (
                <TableRow key={content.id}>
                  <TableCell className="font-medium">{content.title}</TableCell>
                  <TableCell>
                    <span className="capitalize text-xs bg-muted px-2 py-1 rounded">
                      {content.type}
                    </span>
                  </TableCell>
                  <TableCell>{content.platform}</TableCell>
                  <TableCell className="text-right">{content.views.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{content.engagement}%</TableCell>
                  <TableCell className="text-right">{content.clicks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
