"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast, setPosition } from "@/registry/shadcn/toast/store"
import type { ToastPosition } from "@/registry/shadcn/toast/store"
import { Check, Copy } from "lucide-react"

const positions: ToastPosition[] = ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"]

const INSTALL_COMMANDS = {
  npm: "npx shadcn@latest add https://yusufui.vercel.app/r/toast.json",
  pnpm: "pnpm dlx shadcn@latest add https://yusufui.vercel.app/r/toast.json",
  yarn: "yarn dlx shadcn@latest add https://yusufui.vercel.app/r/toast.json",
  bun: "bunx shadcn@latest add https://yusufui.vercel.app/r/toast.json",
}

function InstallCommand() {
  const [pm, setPm] = React.useState<keyof typeof INSTALL_COMMANDS>("npm")
  const [env, setEnv] = React.useState<"local" | "production">("local")
  const [copied, setCopied] = React.useState(false)

  const commands = INSTALL_COMMANDS
  const command = commands[pm]

  const copy = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    toast.success("Copied!", "Installation command copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Installation</CardTitle>
        <CardDescription>Install the toast component in your project</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={pm} onValueChange={(v) => setPm(v as keyof typeof INSTALL_COMMANDS)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="npm">npm</TabsTrigger>
            <TabsTrigger value="pnpm">pnpm</TabsTrigger>
            <TabsTrigger value="yarn">yarn</TabsTrigger>
            <TabsTrigger value="bun">bun</TabsTrigger>
          </TabsList>
          <div className="mt-4">
            <div className="relative">
              <pre className="rounded-lg bg-muted p-4 pr-12 text-sm overflow-x-auto"><code>{command}</code></pre>
              <Button size="icon" variant="ghost" className="absolute right-2 top-2" onClick={copy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default function Home() {
  const simulateApi = () => new Promise((resolve, reject) => setTimeout(() => Math.random() > 0.5 ? resolve("Data loaded!") : reject("Failed"), 2000))

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Shadcn Toast</h1>
          <p className="text-lg text-muted-foreground">Beautiful toast notifications with stacking, inspired by Sonner</p>
        </div>

        <InstallCommand />

        <Card>
          <CardHeader>
            <CardTitle>Toast Types</CardTitle>
            <CardDescription>Different types of toast notifications</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" onClick={() => toast.success("Success", "Operation completed")}>Success</Button>
            <Button variant="outline" onClick={() => toast.error("Error", "Something went wrong")}>Error</Button>
            <Button variant="outline" onClick={() => toast.info("Info", "Here's some information")}>Info</Button>
            <Button variant="outline" onClick={() => toast.warning("Warning", "Please be careful")}>Warning</Button>
            <Button variant="outline" onClick={() => { const id = toast.loading("Loading", "Please wait..."); setTimeout(() => toast.update(id, { type: "success", title: "Complete", description: "Task finished!", duration: 3000 }), 2500) }}>Loading</Button>
            <Button variant="outline" onClick={() => toast.show({ title: "Default", description: "This is a default toast" })}>Default</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advanced</CardTitle>
            <CardDescription>Promise handling, actions, and multiple toasts</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" onClick={() => toast.promise(simulateApi(), { loading: { title: "Loading", description: "Fetching..." }, success: (data) => ({ title: "Success", description: String(data) }), error: (err) => ({ title: "Error", description: String(err) }) })}>Promise</Button>
            <Button variant="outline" onClick={() => { toast.info("First", "This is the first"); setTimeout(() => toast.success("Second", "This is the second"), 200); setTimeout(() => toast.warning("Third", "This is the third"), 400) }}>Multiple</Button>
            <Button variant="outline" onClick={() => toast.show({ title: "Long Duration", description: "Stays for 10 seconds", duration: 10000 })}>Long Duration</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Position</CardTitle>
            <CardDescription>Change where toasts appear</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {positions.map((pos) => (
              <Button key={pos} variant="outline" onClick={() => { setPosition(pos); toast.success("Position Changed", `Now at ${pos}`) }} className="capitalize">{pos.replace("-", " ")}</Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>How to use the toast component</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto"><code>{`import { toast } from "@/registry/shadcn/toast/store"

// Simple
toast.success("Success", "Operation completed")

// Promise
toast.promise(fetchData(), {
  loading: { title: "Loading", description: "Fetching..." },
  success: { title: "Success", description: "Done!" },
  error: { title: "Error", description: "Failed" }
})

// Change position
import { setPosition } from "@/registry/shadcn/toast/store"
setPosition("top-center")`}</code></pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
