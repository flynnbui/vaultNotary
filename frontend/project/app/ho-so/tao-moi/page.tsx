'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Layout } from '@/src/components/layout/Layout';
import { Button } from '@/src/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog';
import { PartiesAccordion } from '@/src/components/forms/PartiesAccordion';
import { FileMetaCard } from '@/src/components/forms/FileMetaCard';
import { fileSchema, type FileFormData } from '@/src/lib/schemas';
import { apiService } from '@/src/lib/api';
import { FileText, Plus } from 'lucide-react';
import { toast } from 'sonner';
import '@/src/lib/i18n';

export default function NewFilePage() {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const methods = useForm<FileFormData>({
    resolver: zodResolver(fileSchema),
    defaultValues: {
      ngayTao: new Date(),
      thuKy: '',
      congChungVien: '',
      maGiaoDich: '',
      moTa: '',
      loaiHoSo: '',
      parties: {
        A: [],
        B: [],
        C: []
      }
    }
  });

  const onSubmit = async (data: FileFormData) => {
    try {
      await apiService.createFile(data);
      toast.success('Hồ sơ đã được lưu thành công!');
      setIsDialogOpen(false);
      methods.reset();
    } catch (error) {
      console.error('Error creating file:', error);
      toast.error('Có lỗi xảy ra khi lưu hồ sơ. Vui lòng thử lại.');
    }
  };

  const handleCancel = () => {
    if (confirm('Bạn có chắc chắn muốn hủy? Tất cả dữ liệu sẽ bị mất.')) {
      methods.reset();
      toast.info('Đã hủy tạo hồ sơ');
      setIsDialogOpen(false);
    }
  };

  return (
    <Layout>
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-8 w-8 text-orange-600" />
                <h1 className="text-3xl font-bold text-foreground">{t('fileForm.title')}</h1>
              </div>
              <p className="text-muted-foreground">Tạo và quản lý hồ sơ công chứng</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-orange-700 hover:bg-orange-900">
                  <Plus className="h-5 w-5 mr-2" />
                  Tạo hồ sơ mới
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tạo hồ sơ mới</DialogTitle>
                </DialogHeader>
                                <FormProvider {...methods}>
                  <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                    {/* File Meta Information */}
                    <FileMetaCard />
                    
                    {/* Parties Section */}
                    <PartiesAccordion />
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-6 border-t">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleCancel}
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        Huỷ
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-orange-700 hover:bg-orange-900 px-8"
                        disabled={methods.formState.isSubmitting}
                      >
                        {methods.formState.isSubmitting ? 'Đang lưu...' : 'Lưu hồ sơ'}
                      </Button>
                    </div>
                  </form>
                </FormProvider>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* File list or dashboard content can go here */}
        <div className="space-y-6">
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Chưa có hồ sơ nào
            </h3>
            <p className="text-muted-foreground">
              Nhấn "Tạo hồ sơ mới" để bắt đầu
            </p>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}