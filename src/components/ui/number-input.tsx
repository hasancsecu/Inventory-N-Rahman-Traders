import * as React from 'react'

/**
 * Strips unnatural leading zeros while preserving valid decimals.
 * - "05" -> "5"
 * - "007" -> "7"
 * - "0" -> "0"
 * - "0." -> "0."
 * - "0.5" -> "0.5"
 * - "00.5" -> "0.5"
 * - "" -> ""
 */
export function cleanNumericString(value: string): string {
  if (!value) return ''
  let cleaned = value.replace(/^0+(?=\d)/, '')
  if (cleaned.startsWith('.')) {
    cleaned = '0' + cleaned
  }
  return cleaned
}

/**
 * Auto-selects text on focus so users can immediately type to overwrite without leading zeros.
 */
export function handleNumericFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.target.select()
}

/**
 * Strips leading zeros and updates the input value.
 */
export function handleNumericChange(
  e: React.ChangeEvent<HTMLInputElement>,
  onChange?: (val: string) => void
): string {
  const cleaned = cleanNumericString(e.target.value)
  e.target.value = cleaned
  onChange?.(cleaned)
  return cleaned
}

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: 'number' | 'text'
}

/**
 * Drop-in <NumberInput /> component that prevents leading zeros
 * and selects content automatically on focus.
 */
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ onFocus, onChange, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="number"
        {...props}
        onFocus={(e) => {
          e.target.select()
          onFocus?.(e)
        }}
        onChange={(e) => {
          const cleaned = cleanNumericString(e.target.value)
          e.target.value = cleaned
          onChange?.(e)
        }}
      />
    )
  }
)

NumberInput.displayName = 'NumberInput'
