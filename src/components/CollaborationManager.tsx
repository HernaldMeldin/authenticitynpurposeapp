import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CollaboratorInviteDialog } from './CollaboratorInviteDialog';
import { CollaboratorList } from './CollaboratorList';
import { SharedActivityFeed } from './SharedActivityFeed';
import { SharedComments } from './SharedComments';
import { TaskAssignment } from './TaskAssignment';
import { useCollaboration } from '@/hooks/useCollaboration';
import { UserPlus, Users, Activity, MessageCircle, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';


interface CollaborationManagerProps {
  goalId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CollaborationManager = ({ goalId, open, onOpenChange }: CollaborationManagerProps) => {
  const [inviteOpen, setInviteOpen] = useState(false);
  const { collaborators, activities, userRole, inviteCollaborator, updateRole, removeCollaborator } = useCollaboration(goalId);

  const handleInvite = async (email: string, role: 'editor' | 'viewer') => {
    return await inviteCollaborator(email, role);
  };

  const handleUpdateRole = async (collaboratorId: string, newRole: string) => {
    const success = await updateRole(collaboratorId, newRole);
    if (success) {
      toast.success('Role updated successfully');
    } else {
      toast.error('Failed to update role');
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    const success = await removeCollaborator(collaboratorId);
    if (success) {
      toast.success('Collaborator removed');
    } else {
      toast.error('Failed to remove collaborator');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Collaborators</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="collaborators" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="collaborators" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Comments
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="collaborators" className="space-y-4">
              {(userRole === 'owner' || userRole === 'editor') && (
                <Button onClick={() => setInviteOpen(true)} className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Collaborator
                </Button>
              )}
              <CollaboratorList
                collaborators={collaborators}
                userRole={userRole}
                onUpdateRole={handleUpdateRole}
                onRemove={handleRemove}
              />
            </TabsContent>
            
            <TabsContent value="tasks">
              <TaskAssignment goalId={goalId} collaborators={collaborators} />
            </TabsContent>
            
            <TabsContent value="comments">
              <SharedComments goalId={goalId} />
            </TabsContent>
            
            <TabsContent value="activity">
              <SharedActivityFeed activities={activities} />
            </TabsContent>

          </Tabs>
        </DialogContent>
      </Dialog>
      <CollaboratorInviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvite={handleInvite}
      />
    </>
  );
};
