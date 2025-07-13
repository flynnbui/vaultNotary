'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/src/components/ui/button';
import { Menu, FileText, User, LogOut, Settings } from 'lucide-react';
import { useAppStore } from '@/src/lib/store';
import { ModeToggle } from '@/src/components/ui/mode-toggle';
import { useUser } from '@auth0/nextjs-auth0';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import Link from 'next/link';

export function Navbar() {
  const { t } = useTranslation();
  const { setSidebarOpen } = useAppStore();
  const { user, isLoading } = useUser();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
            <Link href="/" className="flex items-center ml-4 lg:ml-0 hover:opacity-80 transition-opacity">
              <Image
                src="/logo.png"
                alt="Văn phòng Công chứng Nhà Rồng"
                width={72}
                height={72}
                className="object-contain"
              />
              <span className="ml-2 text-xl font-bold text-foreground">
                VaultNotary
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            {user && !isLoading ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.picture} alt={user.name || 'User avatar'} />
                      <AvatarFallback className="bg-[#800020] text-white">
                        {getInitials(user.name || user.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Tài khoản</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/auth/logout" className="cursor-pointer text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Đăng xuất</span>
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" disabled>
                <User className="h-5 w-5 mr-2" />
                {isLoading ? 'Loading...' : 'User'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}