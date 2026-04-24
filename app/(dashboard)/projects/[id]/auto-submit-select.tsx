"use client"

import { useRef } from "react"

export function AutoSubmitSelect({
  name,
  defaultValue,
  options,
  className,
}: {
  name: string
  defaultValue: string
  options: Array<{ value: string; label: string }>
  className?: string
}) {
  const ref = useRef<HTMLSelectElement>(null)
  return (
    <select
      ref={ref}
      name={name}
      defaultValue={defaultValue}
      className={className}
      onChange={() => ref.current?.form?.requestSubmit()}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
