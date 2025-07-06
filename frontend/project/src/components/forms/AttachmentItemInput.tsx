'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Upload, FileText, Trash2 } from 'lucide-react';

interface AttachmentItem {
  name: string;
  required: boolean;
  hasQuantity?: boolean;
}

interface AttachmentItemInputProps {
  attachment: AttachmentItem;
  index: number;
}

export function AttachmentItemInput({ attachment, index }: AttachmentItemInputProps) {
  const { t } = useTranslation();
  const { watch, setValue } = useFormContext();
  const formAttachments = watch('attachments') || [];
  const formAttachment = formAttachments[index];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newAttachments = [...formAttachments];
    if (!newAttachments[index]) {
      newAttachments[index] = { name: attachment.name, required: attachment.required, files: [] };
    }
    newAttachments[index].files = [...(newAttachments[index].files || []), ...acceptedFiles];
    setValue('attachments', newAttachments);
  }, [formAttachments, setValue, attachment, index]);

  const removeFile = (fileIndex: number) => {
    const newAttachments = [...formAttachments];
    newAttachments[index].files.splice(fileIndex, 1);
    setValue('attachments', newAttachments);
  };

  const updateQuantity = (quantity: number) => {
    const newAttachments = [...formAttachments];
    if (!newAttachments[index]) {
      newAttachments[index] = { name: attachment.name, required: attachment.required };
    }
    newAttachments[index].quantity = quantity;
    setValue('attachments', newAttachments);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  });

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={!!formAttachment?.files?.length}
                disabled
              />
              <Label className="text-sm font-medium">
                {attachment.name}
                {attachment.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            {attachment.hasQuantity && (
              <div className="flex items-center space-x-2">
                <Label className="text-sm">{t('attachments.quantity')}:</Label>
                <Input
                  type="number"
                  min="1"
                  value={formAttachment?.quantity || 1}
                  onChange={(e) => updateQuantity(parseInt(e.target.value) || 1)}
                  className="w-16 h-8"
                />
              </div>
            )}
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${
              isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {isDragActive ? 'Thả tệp vào đây...' : 'Kéo thả tệp hoặc nhấp để chọn'}
              </p>
              <Button type="button" variant="outline" size="sm" className="mt-2">
                {t('attachments.uploadFile')}
              </Button>
            </div>
          </div>

          {formAttachment?.files?.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tệp đã tải lên:</Label>
              {formAttachment.files.map((file: File, fileIndex: number) => (
                <div key={fileIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(fileIndex)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}