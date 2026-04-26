"use client"

import { Diamond } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function DiamondCTA() {
  return (
    <Button
      size="lg"
      className="w-full bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white border-0 font-semibold"
      onClick={() =>
        toast("Em breve!", {
          description: "O pagamento estará disponível em breve. Aguarde!",
          icon: "💎",
        })
      }
    >
      <Diamond className="h-4 w-4" />
      Assinar Diamond
    </Button>
  )
}
