interface ArgusMarkProps {
  className?: string;
}

// Marca de Argus: un ojo (Argos Panoptes, el de los cien ojos). Usa
// `currentColor`, así toma el color de marca de cada tema.
export function ArgusMark({ className }: ArgusMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      role="img"
      aria-label="Argus"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" />
    </svg>
  );
}
