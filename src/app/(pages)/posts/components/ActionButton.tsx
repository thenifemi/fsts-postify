import { Button } from '@/app/components/ui/button';
import { motion } from 'framer-motion';

interface ActionButtonProps {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  motionProps?: Record<string, any>;
  variant?: 'outline' | 'ghost';
}

export default function ActionButton({
  icon,
  label,
  variant = 'ghost',
  onClick,
  disabled,
  motionProps,
}: ActionButtonProps) {
  return (
    <div className='flex-1'>
      <Button
        variant={variant}
        size='sm'
        className='w-min cursor-pointer hover:bg-muted-foreground/10 focus:ring-2 focus:ring-primary/20'
        onClick={onClick}
        disabled={disabled}
        aria-label={typeof label === 'string' ? label : undefined}
      >
        <motion.div {...motionProps} whileTap={{ scale: 0.95 }}>
          {icon}
        </motion.div>
        {label && (
          <span className='ml-1 text-xs text-muted-foreground'>{label}</span>
        )}
      </Button>
    </div>
  );
}
