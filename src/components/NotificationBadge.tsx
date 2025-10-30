import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationBadgeProps {
  onClick?: () => void;
}

export function NotificationBadge({ onClick }: NotificationBadgeProps) {
  const { unreadCount } = useNotifications();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={onClick}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
