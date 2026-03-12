"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

const TRUNCATE_AT = 400

interface Props {
  text: string
}

export function DescriptionToggle({ text }: Props) {
  const [expanded, setExpanded] = useState(false)
  const needsToggle = text.length > TRUNCATE_AT
  const displayed = needsToggle && !expanded ? text.slice(0, TRUNCATE_AT) + "…" : text

  return (
    <div>
      <p className="text-ar-silver whitespace-pre-wrap text-sm leading-relaxed">{displayed}</p>
      {needsToggle && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-3 flex items-center gap-1 text-sm font-medium text-ar-gold hover:text-ar-gold/80 transition-colors"
        >
          {expanded ? (
            <><ChevronUp className="h-4 w-4" /> Lire moins</>
          ) : (
            <><ChevronDown className="h-4 w-4" /> Lire plus</>
          )}
        </button>
      )}
    </div>
  )
}
