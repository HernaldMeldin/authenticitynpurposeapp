import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { PasswordResetForm } from './PasswordResetForm';

type AuthMode = 'login' | 'signup' | 'reset';

interface AuthModalProps {
  trigger?: React.ReactNode;
  defaultMode?: AuthMode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  trigger, 
  defaultMode = 'login',
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}) => {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;


  const handleToggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  const handleForgotPassword = () => {
    setMode('reset');
  };

  const handleBackToLogin = () => {
    setMode('login');
  };

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm
            onToggleMode={handleToggleMode}
            onForgotPassword={handleForgotPassword}
          />
        );
      case 'signup':
        return <SignUpForm onToggleMode={handleToggleMode} />;
      case 'reset':
        return <PasswordResetForm onBack={handleBackToLogin} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md p-0 border-0 bg-transparent">
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
};