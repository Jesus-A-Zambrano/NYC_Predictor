import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

// Define el esquema de validación con Zod
const formSchema = z.object({
  borough: z.coerce.number().int().positive({ message: "Debe ser un número positivo." }),
  buildingClassAtTimeOfSale: z.string().min(1, { message: "Este campo es requerido." }),
  grossSquareFeet: z.coerce.number().positive({ message: "Debe ser un número positivo." }),
  yearBuilt: z.coerce
    .number()
    .int()
    .min(1800, { message: "El año debe ser válido y mayor a 1800." })
    .max(new Date().getFullYear(), { message: "El año no puede ser mayor al actual." }),
})

export const Route = createFileRoute("/")({
  component: Index,
})

function Index() {
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      borough: undefined,
      buildingClassAtTimeOfSale: "",
      grossSquareFeet: undefined,
      yearBuilt: undefined,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)
    setEstimatedPrice(null)
    console.log("Valores del formulario:", values)

    try {
      // TODO: Reemplazar con la URL correcta del backend
      const response = await fetch("http://localhost:3000/predict", {
        // Asumimos /predict como endpoint temporal
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error del servidor: ${response.status}`)
      }

      const data = await response.json()
      setEstimatedPrice(data.estimatedPrice) // Asumimos que el backend devuelve { estimatedPrice: ... }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Ocurrió un error desconocido.")
      }
      console.error("Error al enviar el formulario:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Calculadora de Precios de Propiedades en NYC
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="borough"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Borough (Municipio)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ej: 1 (Manhattan)"
                    {...field}
                    onChange={e =>
                      field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                    }
                  />
                </FormControl>
                <FormDescription>Ingresa el código numérico del municipio.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="buildingClassAtTimeOfSale"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Building Class at Time of Sale (Clase de Edificio)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: R4 - TWO FAMILY DWELLING" {...field} />
                </FormControl>
                <FormDescription>
                  Clasificación del edificio en el momento de la venta.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="grossSquareFeet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gross Square Feet (Pies Cuadrados Brutos)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="Ej: 1500.50"
                    {...field}
                    onChange={e =>
                      field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))
                    }
                  />
                </FormControl>
                <FormDescription>Superficie total en pies cuadrados.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="yearBuilt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year Built (Año de Construcción)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ej: 1990"
                    {...field}
                    onChange={e =>
                      field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                    }
                  />
                </FormControl>
                <FormDescription>Año en que se construyó la propiedad.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Calculando..." : "Calculate Price"}
          </Button>
        </form>
      </Form>

      {isLoading && <p className="mt-4 text-center">Obteniendo estimación...</p>}
      {error && <p className="mt-4 text-red-500 text-center">Error: {error}</p>}
      {estimatedPrice !== null && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h2 className="text-xl font-semibold">Precio Estimado:</h2>
          <p className="text-2xl">${estimatedPrice.toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}
