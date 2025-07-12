import React, { forwardRef } from 'react';
import { UseFormReturn, FieldPath, FieldValues, PathValue, Path } from 'react-hook-form';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Button } from '@/src/components/ui/button';
import { Calendar } from '@/src/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/src/lib/utils';

interface BaseFormFieldProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  label: string;
  methods: UseFormReturn<TFieldValues>;
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  description?: string;
  className?: string;
}

interface InputFormFieldProps<TFieldValues extends FieldValues> extends BaseFormFieldProps<TFieldValues> {
  type: 'input';
  inputType?: 'text' | 'email' | 'password' | 'number' | 'tel';
}

interface TextareaFormFieldProps<TFieldValues extends FieldValues> extends BaseFormFieldProps<TFieldValues> {
  type: 'textarea';
  rows?: number;
}

interface SelectFormFieldProps<TFieldValues extends FieldValues> extends BaseFormFieldProps<TFieldValues> {
  type: 'select';
  options: Array<{ value: string; label: string }>;
}

interface DateFormFieldProps<TFieldValues extends FieldValues> extends BaseFormFieldProps<TFieldValues> {
  type: 'date';
}

type FormFieldProps<TFieldValues extends FieldValues> = 
  | InputFormFieldProps<TFieldValues>
  | TextareaFormFieldProps<TFieldValues>
  | SelectFormFieldProps<TFieldValues>
  | DateFormFieldProps<TFieldValues>;

export function FormField<TFieldValues extends FieldValues>({
  name,
  label,
  methods,
  required = false,
  readOnly = false,
  placeholder,
  description,
  className,
  ...props
}: FormFieldProps<TFieldValues>) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = methods;

  const error = errors[name];
  const value = watch(name);

  const fieldId = `field-${name}`;

  const renderField = () => {
    switch (props.type) {
      case 'input':
        return (
          <Input
            id={fieldId}
            type={props.inputType || 'text'}
            placeholder={placeholder}
            readOnly={readOnly}
            {...register(name)}
            className={cn(
              error && "border-red-500 focus:border-red-500",
              readOnly && "bg-muted",
              className
            )}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={fieldId}
            rows={props.rows || 3}
            placeholder={placeholder}
            readOnly={readOnly}
            {...register(name)}
            className={cn(
              error && "border-red-500 focus:border-red-500",
              readOnly && "bg-muted",
              className
            )}
          />
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(selectedValue) => setValue(name, selectedValue as PathValue<TFieldValues, Path<TFieldValues>>)}
            disabled={readOnly}
          >
            <SelectTrigger
              id={fieldId}
              className={cn(
                error && "border-red-500 focus:border-red-500",
                readOnly && "bg-muted",
                className
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {props.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id={fieldId}
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground",
                  error && "border-red-500 focus:border-red-500",
                  readOnly && "bg-muted pointer-events-none",
                  className
                )}
                disabled={readOnly}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(value, "PPP", { locale: vi }) : <span>{placeholder}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value}
                onSelect={(date) => setValue(name, date as PathValue<TFieldValues, Path<TFieldValues>>)}
                initialFocus
                locale={vi}
              />
            </PopoverContent>
          </Popover>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {renderField()}
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-500">
          {error.message as string}
        </p>
      )}
    </div>
  );
}

// Re-export for convenience
export default FormField;