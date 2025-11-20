import { Loader2 } from "lucide-react"


const PageLoader = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        </div>
    )
}

export default PageLoader