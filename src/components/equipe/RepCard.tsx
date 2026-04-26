import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MetaProgress } from "./MetaProgress"
import { iniciais, formatarMoeda } from "@/lib/utils"

interface Rep {
  id: string
  name: string
  email: string
  role: string
  goal: number
  dealsWon: number
  receitaFechada: number
  activitiesCount: number
}

export function RepCard({ rep }: { rep: Rep }) {
  return (
    <div className="glass rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-cyan-500/10 text-cyan-400 font-semibold">
            {iniciais(rep.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{rep.name}</p>
          <p className="text-xs text-muted-foreground truncate">{rep.email}</p>
          <Badge variant="outline" className="mt-1 text-xs">
            {rep.role === "ADMIN" ? "Admin" : rep.role === "MANAGER" ? "Gestor" : "Vendedor"}
          </Badge>
        </div>
      </div>

      <MetaProgress atual={rep.receitaFechada} meta={rep.goal} />

      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5">
        <div className="text-center">
          <p className="text-lg font-bold text-cyan-400">{rep.dealsWon}</p>
          <p className="text-xs text-muted-foreground">Ganhos</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-white">{formatarMoeda(rep.receitaFechada)}</p>
          <p className="text-xs text-muted-foreground">Receita</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-purple-400">{rep.activitiesCount}</p>
          <p className="text-xs text-muted-foreground">Atividades</p>
        </div>
      </div>
    </div>
  )
}
