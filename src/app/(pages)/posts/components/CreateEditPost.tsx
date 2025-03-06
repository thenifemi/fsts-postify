'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import { ImagePlus, Loader2, PlusCircle, CircleX } from 'lucide-react';
import Image from 'next/image';
import { POST_ROUTES } from '@/app/api/route_paths';
import { toast } from 'sonner';
import { Input } from '@/app/components/ui/input';

interface CreateEditPostProps {
  postId?: string;
  isEdit?: boolean;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export default function CreateEditPost({
  postId,
  isEdit = false,
  onSuccess,
  trigger,
}: CreateEditPostProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_IMAGES = 10;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    if (images.length + newFiles.length > MAX_IMAGES) {
      toast.error(`You can only upload up to ${MAX_IMAGES} images`);
      return;
    }

    setImages((prev) => [...prev, ...newFiles]);

    const newUrls = newFiles.map((file) => URL.createObjectURL(file));
    setImageUrls((prev) => [...prev, ...newUrls]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imageUrls[index]);

    setImages(images.filter((_, i) => i !== index));
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please enter some content for your post');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('content', content);
      images.forEach((image) => {
        formData.append('images', image);
      });

      const url = isEdit
        ? POST_ROUTES.UPDATE(postId as string)
        : POST_ROUTES.CREATE;

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to save post');
      }

      toast.success(
        isEdit ? 'Post updated successfully' : 'Post created successfully'
      );
      setOpen(false);
      setContent('');
      setImages([]);
      setImageUrls([]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant='outline'>
            <PlusCircle className='w-4 h-4' strokeWidth={1} />
            Create Post
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Post' : 'Create New Post'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update your post content and images'
              : 'Penny for your thoughts (and photos?)'}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <Textarea
            placeholder="What's on your mind?"
            className='min-h-[100px]'
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className='w-full'>
            <div className='grid grid-cols-3 gap-2 w-full'>
              {images.length < MAX_IMAGES && (
                <div>
                  <label
                    htmlFor='image-upload'
                    className='cursor-pointer h-24 w-full border border-dashed rounded-md flex items-center justify-center bg-accent/20'
                  >
                    <div className='flex flex-col items-center gap-1 text-sm text-muted-foreground'>
                      <ImagePlus className='h-5 w-5' strokeWidth={1} />
                      <span className='text-xs text-center'>
                        Add Photo
                        <br />
                        <span className='text-[10px] text-muted-foreground'>
                          (up to 10 photos)
                        </span>
                      </span>
                    </div>
                    <Input
                      id='image-upload'
                      type='file'
                      accept='image/*'
                      multiple
                      className='hidden'
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              )}

              {imageUrls.map((url, index) => (
                <div
                  key={index}
                  className='relative h-24 w-full rounded-md overflow-hidden border aspect-square'
                >
                  <Image
                    src={url}
                    alt={`Upload ${index + 1}`}
                    fill
                    className='object-cover'
                  />

                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    onClick={() => removeImage(index)}
                    className='absolute top-1 right-1 h-5 w-5 bg-black/60 hover:bg-black/80 border-0 rounded-full p-0.5 cursor-pointer'
                  >
                    <CircleX className='h-4 w-4 text-white' />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => setOpen(false)}
            className='cursor-pointer'
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className='cursor-pointer'
          >
            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isEdit ? 'Update' : 'Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
