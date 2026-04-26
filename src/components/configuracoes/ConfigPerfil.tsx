"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateUser } from "@/server/actions/users"

const schema = z.object({
  name: z.string().min(2),
  goal: z.number().min(0),
  goalPeriod: z.enum(["MENSAL", "TRIMESTRAL", "ANUAL"]),
})
type FormData = z.infer<typeof schema>

interface User {
  id: string
  name: string
  email: string
  goal: number
  goalPeriod: string
  timezone: string
}

export function ConfigPerfil({ user }: { user: User }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      goal: user.goal,
      goalPeriod: user.goalPeriod as "MENSAL" | "TRIMESTRAL" | "ANUAL",
    },
  })

  async function onSubmit(data: FormData) {
    try {
      await updateUser(user.id, data)
      toast.success("Perfil atualizado!")
    } catch {
      toast.error("Erro ao atualizar perfil")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Nome</Label>
          <Input {...register("name")} className="bg-white/5 border-white/10" />
        </div>
        <div className="space-y-1.5">
          <Label>E-mail</Label>
          <Input value={user.email} disabled className="bg-white/5 border-white/10 opacity-60" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Meta de Vendas (R$)</Label>
          <Input type="number" step="1000" {...register("goal", { valueAsNumber: true })} className="bg-white/5 border-white/10" />
        </div>
        <div className="space-y-1.5">
          <Label>Período da Meta</Label>
          <select {...register("goalPeriod")} className="flex h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm text-foreground">
            <option value="MENSAL" className="bg-background">Mensal</option>
            <option value="TRIMESTRAL" className="bg-background">Trimestral</option>
            <option value="ANUAL" className="bg-background">Anual</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
