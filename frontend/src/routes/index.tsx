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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { createFileRoute } from "@tanstack/react-router"
import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { buildingCodes } from "@/lib/buildingCodes"

const boroughs = [
  { value: 1, label: "1 - Manhattan" },
  { value: 2, label: "2 - The Bronx" },
  { value: 3, label: "3 - Brooklyn" },
  { value: 4, label: "4 - Queens" },
  { value: 5, label: "5 - Staten Island" },
];

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
  // Change state type to string | null as backend will send formatted string
  const [estimatedPrice, setEstimatedPrice] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      borough: undefined,
      buildingClassAtTimeOfSale: "", // Default to empty string for combobox input
      grossSquareFeet: undefined,
      yearBuilt: undefined,
    },
  })

  // State for the combobox input value and suggestions visibility
  const [buildingClassInput, setBuildingClassInput] = useState('')
  const [showBuildingClassSuggestions, setShowBuildingClassSuggestions] = useState(false)

  // Filter building codes based on input value
  const filteredBuildingCodes = useMemo(() => {
    if (!buildingClassInput) return buildingCodes;
    return buildingCodes.filter(code =>
      code.code.toLowerCase().includes(buildingClassInput.toLowerCase()) ||
      code.description.toLowerCase().includes(buildingClassInput.toLowerCase())
    );
  }, [buildingClassInput]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)
    setEstimatedPrice(null)
    console.log("Valores del formulario:", values)

    // Ensure a building class is selected (form validation should handle this too)
    if (!values.buildingClassAtTimeOfSale) {
      setError("Please select a Building Class.");
      setIsLoading(false);
      return;
    }

    try {
      // Use the relative path which will be proxied by Nginx in production
      // and by Vite dev server in development
      const response = await fetch("/api/predict", {
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
      // Set the state directly with the received string prediction
      setEstimatedPrice(data.prediction)
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
        Predicción de Precios de Inmuebles en Nueva York
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="borough"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Borough (Municipio)</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un municipio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {boroughs.map((borough) => (
                      <SelectItem key={borough.value} value={borough.value.toString()}>
                        {borough.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Selecciona el municipio de la propiedad.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="buildingClassAtTimeOfSale"
            render={({ field }) => (
              <FormItem className="flex flex-col relative">
                <FormLabel>Building Class at Time of Sale (Clase de Edificio)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Empieza a escribir..."
                    value={buildingClassInput}
                    onChange={(e) => {
                      setBuildingClassInput(e.target.value);
                      // Clear the form field value when the input changes manually
                      field.onChange('');
                      setShowBuildingClassSuggestions(true);
                    }}
                    onFocus={() => setShowBuildingClassSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowBuildingClassSuggestions(false), 100)}
                  />
                </FormControl>
                <FormDescription>
                  Selecciona la clasificación del edificio en el momento de la venta.
                </FormDescription>
                <FormMessage />

                {showBuildingClassSuggestions && filteredBuildingCodes.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-full border rounded-md max-h-48 overflow-y-auto z-10 bg-white shadow-md">
                    {filteredBuildingCodes.map((code) => (
                      <div
                        key={code.code}
                        className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                        onClick={() => {
                          setBuildingClassInput(code.description);
                          field.onChange(code.code); // Update form field with the code
                          setShowBuildingClassSuggestions(false);
                        }}
                      >
                        {code.description}
                      </div>
                    ))}
                  </div>
                )}
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
          {/* Parse the string to a number and format for display */}
          <p className="text-2xl">${parseFloat(estimatedPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      )}
    </div>
  )
}