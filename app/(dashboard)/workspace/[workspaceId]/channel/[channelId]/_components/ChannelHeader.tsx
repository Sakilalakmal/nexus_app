import { ToggleTheme } from "@/components/ui/Theme-toggler";

export function ChannelHeader() {
  return (
    <header className="flex h-14 w-full items-center justify-between border-b px-4">
      <h1 className="flex-1 text-lg font-semibold text-foreground">#full-stack-bots-gang</h1>
      <div className="flex items-center gap-2">
        <ToggleTheme />
      </div>
    </header>
  );
}
