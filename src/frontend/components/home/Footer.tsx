/**
 * Footer displays project attribution and a usage disclaimer
 * Server component - no interactivity needed
 */
export function Footer() {
  return (
    <footer className="pt-4 pb-4 text-center text-sm text-slate-400">
      <p className="text-sm">
        &copy; 2025 OrthoVision - Hallares et al. All rights reserved.
      </p>
      <p className="mt-2 text-sm px-px">
        This tool is for educational purposes only and should not replace
        professional medical advice.
      </p>
    </footer>
  );
}
