// Dunne wrapper rond Plausible voor conversie-events (goals). Veilig: als
// Plausible (nog) niet geladen is, wordt het event in de wachtrij gezet door
// de stub in index.html; is er helemaal geen Plausible, dan gebeurt er niets.
export function track(event: string, props?: Record<string, string | number | boolean>): void {
  try {
    const p = (window as any).plausible;
    if (typeof p === 'function') {
      p(event, props ? { props } : undefined);
    }
  } catch {
    /* analytics mag de app nooit breken */
  }
}
