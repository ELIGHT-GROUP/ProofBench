import { cn } from "@/lib/utils"



const Logo = ({ className }: { className?: string }) => {
    return (
        <div className="flex items-center space-x-3">
            <span className={cn("text-2xl font-bold text-primary tracking-tight", className)}>ProofBench</span>
        </div>
    )
}

export default Logo