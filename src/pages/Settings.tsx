import { useState } from "react";
import { User, Building2, Link2, Linkedin, Twitter, Instagram, Check, X, Save, Plus, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const connectedPlatforms = [
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, connected: true, account: '@mycompany' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, connected: false, account: null },
  { id: 'instagram', name: 'Instagram', icon: Instagram, connected: false, account: null },
];

export default function Settings() {
  const { workspace, workspaceId, isLoading: workspaceLoading, error: workspaceError, setWorkspaceId, createWorkspace } = useWorkspace();
  
  const [userName, setUserName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  // Workspace form states
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newOwnerId, setNewOwnerId] = useState('');
  const [manualWorkspaceId, setManualWorkspaceId] = useState('');
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Settings saved successfully');
    setSaving(false);
  };

  const handleConnect = (platformName: string) => {
    toast.info(`Connecting to ${platformName}...`, {
      description: 'MCP will handle OAuth flow',
    });
  };

  const handleDisconnect = (platformName: string) => {
    toast.success(`Disconnected from ${platformName}`);
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim() || !newOwnerId.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setCreatingWorkspace(true);
    try {
      const ws = await createWorkspace(newWorkspaceName.trim(), newOwnerId.trim());
      toast.success(`Workspace "${ws.name}" created successfully!`);
      setNewWorkspaceName('');
      setNewOwnerId('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create workspace');
    } finally {
      setCreatingWorkspace(false);
    }
  };

  const handleSelectWorkspace = () => {
    if (!manualWorkspaceId.trim()) {
      toast.error('Please enter a workspace ID');
      return;
    }
    setWorkspaceId(manualWorkspaceId.trim());
    setManualWorkspaceId('');
    toast.success('Workspace ID set - loading workspace...');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your workspace and account
        </p>
      </div>

      {/* Workspace Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Workspace
          </CardTitle>
          <CardDescription>Manage your workspace settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Workspace Status */}
          {workspaceLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading workspace...
            </div>
          ) : workspace ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Workspace</p>
                    <p className="font-semibold text-lg">{workspace.name}</p>
                  </div>
                  <span className="flex items-center gap-1 text-sm text-success">
                    <Check className="h-4 w-4" />
                    Connected
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Workspace ID</Label>
                <div className="flex items-center gap-2">
                  <code className="px-3 py-2 rounded bg-muted text-sm font-mono flex-1">
                    {workspace.id}
                  </code>
                  <Button variant="outline" size="sm" onClick={() => {
                    navigator.clipboard.writeText(workspace.id);
                    toast.success('Copied to clipboard');
                  }}>
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-center">
              <p className="font-medium text-destructive">No workspace selected</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create a new workspace or enter an existing workspace ID below
              </p>
              {workspaceError && (
                <p className="text-sm text-destructive mt-2">{workspaceError}</p>
              )}
            </div>
          )}

          <Separator />

          {/* Create New Workspace */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Workspace
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input
                  id="workspace-name"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="My Workspace"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-id">Owner ID</Label>
                <Input
                  id="owner-id"
                  value={newOwnerId}
                  onChange={(e) => setNewOwnerId(e.target.value)}
                  placeholder="user_123"
                />
              </div>
            </div>
            <Button 
              onClick={handleCreateWorkspace}
              disabled={creatingWorkspace || !newWorkspaceName.trim() || !newOwnerId.trim()}
            >
              {creatingWorkspace ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Workspace
                </span>
              )}
            </Button>
          </div>

          <Separator />

          {/* Select Existing Workspace */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Select Existing Workspace
            </h4>
            <div className="flex gap-2">
              <Input
                value={manualWorkspaceId}
                onChange={(e) => setManualWorkspaceId(e.target.value)}
                placeholder="Enter workspace ID (e.g., ws_abc123)"
                className="flex-1"
              />
              <Button 
                variant="outline"
                onClick={handleSelectWorkspace}
                disabled={!manualWorkspaceId.trim()}
              >
                Switch
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Platforms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Connected Platforms
          </CardTitle>
          <CardDescription>Manage your social media connections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectedPlatforms.map((platform) => (
            <div
              key={platform.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border"
            >
              <div className="flex items-center gap-4">
                <div className={`
                  h-10 w-10 rounded-lg flex items-center justify-center
                  ${platform.connected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                `}>
                  <platform.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{platform.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {platform.connected ? platform.account : 'Not connected'}
                  </p>
                </div>
              </div>
              
              {platform.connected ? (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-sm text-success">
                    <Check className="h-4 w-4" />
                    Connected
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDisconnect(platform.name)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline"
                  onClick={() => handleConnect(platform.name)}
                >
                  Connect
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about workflow completions
              </p>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="gradient-primary text-primary-foreground"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
