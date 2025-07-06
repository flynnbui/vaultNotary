'use client';

import * as React from 'react';
import { Input } from '@/src/components/ui/input';
import { formatCurrency } from '@/src/lib/constants';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value?: number;
    onChange?: (value: number) => void;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ value = 0, onChange, ...props }, ref) => {
        const [displayValue, setDisplayValue] = React.useState(formatCurrency(value));

        React.useEffect(() => {
            setDisplayValue(formatCurrency(value));
        }, [value]);

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value;
            // Remove all non-numeric characters
            const numericValue = inputValue.replace(/[^\d]/g, '');
            const numberValue = parseInt(numericValue) || 0;

            setDisplayValue(formatCurrency(numberValue));
            onChange?.(numberValue);
        };

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            // Show raw number when focused
            setDisplayValue(value.toString());
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            // Show formatted currency when blurred
            setDisplayValue(formatCurrency(value));
        };

        return (
            <Input
                {...props}
                ref={ref}
                value={displayValue}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="0 ₫"
            />
        );
    }
);

CurrencyInput.displayName = 'CurrencyInput';