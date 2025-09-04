'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, File, X, Plus } from 'lucide-react';
import { DataService } from '@/lib/data-service';

interface MaterialUploadProps {
  courseId: string;
  onUploadComplete?: () => void;
}

export function MaterialUpload({ courseId, onUploadComplete }: MaterialUploadProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [materialData, setMaterialData] = useState({
    title: '',
    description: ''
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !materialData.title.trim()) return;

    setIsUploading(true);
    try {
      const success = await DataService.uploadCourseMaterial(courseId, selectedFile, {
        title: materialData.title,
        description: materialData.description
      });

      if (success) {
        setSelectedFile(null);
        setMaterialData({ title: '', description: '' });
        setIsDialogOpen(false);
        onUploadComplete?.();
      }
    } catch (error) {
      console.error('Error uploading material:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Upload className="mr-2 h-4 w-4" />
          Upload Material
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Course Material</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* File Upload Area */}
          <div className="space-y-2">
            <Label>File</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center space-x-2">
                  <File className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Drag and drop a file here, or click to select
                  </p>
                  <Input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm">
                      Choose File
                    </Button>
                  </Label>
                </div>
              )}
            </div>
          </div>

          {/* Material Details */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={materialData.title}
              onChange={(e) => setMaterialData({ ...materialData, title: e.target.value })}
              placeholder="Enter material title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={materialData.description}
              onChange={(e) => setMaterialData({ ...materialData, description: e.target.value })}
              placeholder="Enter material description (optional)"
              rows={3}
            />
          </div>

          {/* File Info */}
          {selectedFile && (
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-gray-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="text-gray-500">
                    {selectedFile.type || 'Unknown type'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || !materialData.title.trim() || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Material'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
