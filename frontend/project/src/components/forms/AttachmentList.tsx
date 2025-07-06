'use client';

import { AttachmentItemInput } from './AttachmentItemInput';

interface AttachmentItem {
  name: string;
  required: boolean;
  hasQuantity?: boolean;
}

interface AttachmentListProps {
  attachments: AttachmentItem[];
}

export function AttachmentList({ attachments }: AttachmentListProps) {
  return (
    <div className="space-y-4 mt-4">
      {attachments.map((attachment, index) => (
        <AttachmentItemInput
          key={index}
          attachment={attachment}
          index={index}
        />
      ))}
    </div>
  );
}