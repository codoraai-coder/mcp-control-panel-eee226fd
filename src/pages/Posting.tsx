import { useState } from "react";
import { Send, Calendar, CheckCircle, Linkedin, Twitter, Instagram, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Content, Platform } from "@/types/mcp";

// Mock approved content
const approvedContent: Content[] = [
  { id: '1', type: 'blog', title: 'AI Trends 2025', description: 'Exploring the future...', status: 'approved', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', type: 'image', title: 'Product Hero Image', status: 'approved', thumbnailUrl: '/placeholder.svg', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', type: 'blog', title: 'MCP Best Practices', description: 'Learn how to...', status: 'approved', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

// Mock platforms
const platforms: Platform[] = [
  { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', connected: true, accountName: '@company' },
  { id: 'twitter', name: 'Twitter', icon: 'twitter', connected: false },
  { id: 'instagram', name: 'Instagram', icon: 'instagram', connected: false },
];

const platformIcons: Record<string, React.ReactNode> = {
  linkedin: <Linkedin className="h-5 w-5" />,
  twitter: <Twitter className="h-5 w-5" />,
  instagram: <Instagram className="h-5 w-5" />,
};

export default function Posting() {
  const [selectedContent, setSelectedContent] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [postType, setPostType] = useState<'now' | 'schedule'>('now');
  const [scheduleDate, setScheduleDate] = useState<Date>();
  const [loading, setLoading] = useState(false);

  const selectedContentItem = approvedContent.find(c => c.id === selectedContent);
  const selectedPlatformItem = platforms.find(p => p.id === selectedPlatform);

  const handlePost = async () => {
    if (!selectedContent || !selectedPlatform) {
      toast.error('Please select content and platform');
      return;
    }

    if (postType === 'schedule' && !scheduleDate) {
      toast.error('Please select a schedule date');
      return;
    }

    setLoading(true);
    // Simulate API call - MCP handles the posting
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (postType === 'now') {
      toast.success('Content posted successfully!', {
        description: 'MCP has published your content.',
      });
    } else {
      toast.success('Post scheduled!', {
        description: `MCP will publish on ${format(scheduleDate!, 'PPP')}`,
      });
    }
    
    setLoading(false);
    setSelectedContent("");
    setSelectedPlatform("");
    setScheduleDate(undefined);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Posting</h1>
        <p className="text-muted-foreground mt-1">
          Select content and publish via MCP
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Content</CardTitle>
              <CardDescription>Choose approved content to post</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedContent} onValueChange={setSelectedContent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content..." />
                </SelectTrigger>
                <SelectContent>
                  {approvedContent.map((content) => (
                    <SelectItem key={content.id} value={content.id}>
                      <div className="flex items-center gap-2">
                        <span className="capitalize text-xs bg-muted px-2 py-0.5 rounded">
                          {content.type}
                        </span>
                        {content.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Platform Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Platform</CardTitle>
              <CardDescription>Where do you want to publish?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => platform.connected && setSelectedPlatform(platform.id)}
                    disabled={!platform.connected}
                    className={`
                      p-4 rounded-lg border-2 transition-all text-left
                      ${selectedPlatform === platform.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'}
                      ${!platform.connected && 'opacity-50 cursor-not-allowed'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        h-10 w-10 rounded-lg flex items-center justify-center
                        ${selectedPlatform === platform.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                      `}>
                        {platformIcons[platform.icon]}
                      </div>
                      <div>
                        <p className="font-medium">{platform.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {platform.connected ? platform.accountName : 'Not connected'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Post Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">When to Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={postType} onValueChange={(v) => setPostType(v as 'now' | 'schedule')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="now" id="now" />
                  <Label htmlFor="now" className="flex items-center gap-2 cursor-pointer">
                    <Send className="h-4 w-4" />
                    Post now
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="schedule" id="schedule" />
                  <Label htmlFor="schedule" className="flex items-center gap-2 cursor-pointer">
                    <Calendar className="h-4 w-4" />
                    Schedule for later
                  </Label>
                </div>
              </RadioGroup>

              {postType === 'schedule' && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      {scheduleDate ? format(scheduleDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={scheduleDate}
                      onSelect={setScheduleDate}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedContentItem && selectedPlatformItem ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-3">
                      {platformIcons[selectedPlatformItem.icon]}
                      <span className="font-medium">{selectedPlatformItem.name}</span>
                    </div>
                    
                    {selectedContentItem.type === 'image' && (
                      <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                        <img 
                          src={selectedContentItem.thumbnailUrl || '/placeholder.svg'} 
                          alt={selectedContentItem.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <h4 className="font-semibold">{selectedContentItem.title}</h4>
                    {selectedContentItem.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedContentItem.description}
                      </p>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>
                      {postType === 'now' 
                        ? 'Will be posted immediately' 
                        : scheduleDate 
                          ? `Scheduled for ${format(scheduleDate, 'PPP')}`
                          : 'Select a date to schedule'}
                    </p>
                  </div>

                  <Button 
                    onClick={handlePost}
                    disabled={loading || (postType === 'schedule' && !scheduleDate)}
                    className="w-full gradient-primary text-primary-foreground"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        {postType === 'now' ? 'Posting...' : 'Scheduling...'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        {postType === 'now' ? 'Post Now' : 'Schedule Post'}
                      </span>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Select content and platform to preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
