export function suggestsAutonomousMode(content: string): boolean {
  return /Switch to \*\*Autonomous\*\* mode/i.test(content);
}
