'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/src/components/ui/button';
import { Menu, FileText, User } from 'lucide-react';
import { useAppStore } from '@/src/lib/store';
import { ModeToggle } from '@/src/components/ui/mode-toggle';

export function Navbar() {
  const { t } = useTranslation();
  const { setSidebarOpen } = useAppStore();

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center ml-4 lg:ml-0">
              <FileText className="h-8 w-8 text-orange-600" />
              <span className="ml-2 text-xl font-bold text-foreground">
                NotaryFile
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            <Button variant="ghost" size="sm">
              <User className="h-5 w-5 mr-2" />
              Admin
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}