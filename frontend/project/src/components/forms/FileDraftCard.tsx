'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { FileTypeStepper } from '@/src/components/forms/FileTypeStepper';
import { FileText } from 'lucide-react';

export function FileDraftCard() {
  const { t } = useTranslation();

  return (
    <Card className="shadow-md border-0">
      <CardHeader className="bg-muted/50 border-b">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-orange-600" />
          {t('fileForm.drafting', 'Soạn thảo')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <FileTypeStepper />
      </CardContent>
    </Card>
  );
}