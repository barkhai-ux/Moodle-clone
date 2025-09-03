'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AvatarSelectorProps {
  currentAvatar?: string;
  onAvatarChange: (avatarUrl: string) => void;
  userName: string;
}

const predefinedAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Riley',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Quinn',
];

export function AvatarSelector({ currentAvatar, onAvatarChange, userName }: AvatarSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const url = URL.createObjectURL(file);
      setUploadedImageUrl(url);
      setSelectedAvatar(url);
    }
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    setUploadedImage(null);
    setUploadedImageUrl('');
  };

  const handleSave = async () => {
    if (selectedAvatar === currentAvatar) {
      setIsOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      await onAvatarChange(selectedAvatar);
      toast({
        title: "Avatar Updated",
        description: "Your avatar has been successfully updated.",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedAvatar(currentAvatar || '');
    setUploadedImage(null);
    setUploadedImageUrl('');
    setIsOpen(false);
  };

  const clearUploadedImage = () => {
    setUploadedImage(null);
    setUploadedImageUrl('');
    setSelectedAvatar(currentAvatar || '');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="h-8 w-8 rounded-full p-0 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 shadow-sm"
        >
          <span className="text-lg font-semibold text-gray-600">+</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Your Avatar</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Avatar Preview */}
          <div className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src={selectedAvatar} alt={userName} />
              <AvatarFallback className="text-2xl">{userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="text-sm text-gray-600">Preview</p>
          </div>

          {/* Upload Custom Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Custom Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label htmlFor="avatar-upload" className="sr-only">
                    Upload avatar image
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Image
                  </Button>
                </div>
                {uploadedImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearUploadedImage}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {uploadedImage && (
                <p className="text-sm text-gray-600">
                  Selected: {uploadedImage.name}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Predefined Avatars */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Choose from Predefined Avatars</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {predefinedAvatars.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => handleAvatarSelect(avatar)}
                    className={`p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedAvatar === avatar && !uploadedImageUrl
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Avatar className="h-16 w-16 mx-auto">
                      <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} />
                      <AvatarFallback className="text-lg">
                        {String.fromCharCode(65 + index)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Avatar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
