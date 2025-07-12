"use client";

import React from "react";
import { useUser } from '@auth0/nextjs-auth0';
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import {
  User,
  Mail
} from "lucide-react";
export default function ProfilePage() {
  const { user, isLoading } = useUser();





  if (isLoading) {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
    );
  }

  if (!user) {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Không thể tải thông tin tài khoản</p>
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <User className="h-8 w-8 text-orange-600" />
                <h1 className="text-3xl font-bold text-foreground">
                  Thông tin tài khoản
                </h1>
              </div>
              <p className="text-muted-foreground">
                Quản lý thông tin cá nhân và cài đặt tài khoản của bạn
              </p>
            </div>

          </div>
        </div>


        {/* Profile Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chi tiết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{user?.name || 'Chưa cập nhật'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user?.email}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
  );
}