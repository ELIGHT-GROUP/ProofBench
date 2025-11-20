import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function ThemeDemo() {
    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-bold">Theme Demo</h1>
                    <ThemeToggle />
                </div>

                <div className="space-y-4">
                    <div className="p-6 bg-card text-card-foreground rounded-lg border">
                        <h2 className="text-2xl font-semibold mb-2">Card Component</h2>
                        <p className="text-muted-foreground">
                            This card demonstrates the theme colors. Toggle between light and dark mode using the button above.
                        </p>
                    </div>

                    <div className="p-6 bg-secondary text-secondary-foreground rounded-lg">
                        <h2 className="text-2xl font-semibold mb-2">Secondary Background</h2>
                        <p>This uses secondary colors from the theme.</p>
                    </div>

                    <div className="p-6 bg-muted text-muted-foreground rounded-lg">
                        <h2 className="text-2xl font-semibold mb-2">Muted Background</h2>
                        <p>This uses muted colors from the theme.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
