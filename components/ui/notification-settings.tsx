'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellOff, Settings } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

export function NotificationSettings() {
  const { 
    isNotificationEnabled, 
    toggleNotifications, 
    totalUnreadCount,
    markAllAsRead 
  } = useNotifications();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Notification Settings</span>
        </CardTitle>
        <CardDescription>
          Manage your chat notification preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="browser-notifications">Browser Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications when the browser is in the background
            </p>
          </div>
          <Switch
            id="browser-notifications"
            checked={isNotificationEnabled}
            onCheckedChange={toggleNotifications}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Unread Messages</Label>
            <p className="text-sm text-muted-foreground">
              {totalUnreadCount} unread messages
            </p>
          </div>
          {totalUnreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            {isNotificationEnabled ? (
              <>
                <Bell className="w-4 h-4 text-green-500" />
                <span>Notifications are enabled</span>
              </>
            ) : (
              <>
                <BellOff className="w-4 h-4 text-gray-500" />
                <span>Notifications are disabled</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
