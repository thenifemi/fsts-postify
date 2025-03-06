import { BookDashed } from 'lucide-react';
import CreateEditPost from './CreateEditPost';
export default function EmptyPosts({}) {
  return (
    <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/50 p-12 text-center shadow-sm space-y-4'>

      <BookDashed strokeWidth={1} className='mb-2 h-10 w-10 text-gray-400' />

      <div className='space-y-1'>
        <p className='text-base font-medium text-muted-foreground'>
          No posts found
        </p>

        <p className='text-sm text-muted-foreground'>
          Posts from you and other users will be displayed here
        </p>
      </div>

      <CreateEditPost />
    </div>
  );
}
