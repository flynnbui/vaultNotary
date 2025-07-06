'use client';

import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Label } from '@/src/components/ui/label';
import { FILE_TYPES } from '@/src/lib/constants';
import { AttachmentList } from './AttachmentList';

export function FileTypeStepper() {
  const { t } = useTranslation();
  const { watch, setValue } = useFormContext();
  const selectedType = watch('loaiHoSo');

  const selectedFileType = FILE_TYPES.find(type => type.value === selectedType);

  useEffect(() => {
    if (selectedFileType) {
      const attachments = selectedFileType.attachments.map(att => ({
        name: att.name,
        required: att.required,
        hasQuantity: att.hasQuantity || false,
        files: [],
        quantity: att.hasQuantity ? 1 : undefined
      }));
      setValue('attachments', attachments);
    }
  }, [selectedType, selectedFileType, setValue]);

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="loaiHoSo">{t('fileForm.fileType')} *</Label>
        <Select
          value={selectedType}
          onValueChange={(value) => setValue('loaiHoSo', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('common.selectOption')} />
          </SelectTrigger>
          <SelectContent>
            {FILE_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedFileType && (
        <div>
          <Label className="text-base font-medium">{t('fileForm.attachments')}</Label>
          <AttachmentList attachments={selectedFileType.attachments} />
        </div>
      )}
    </div>
  );
}