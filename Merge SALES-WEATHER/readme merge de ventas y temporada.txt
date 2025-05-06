Combinamos dos conjuntos de datos diferentes usando la fecha como punto de unión.

Primero, teníamos el archivo de SALES. De acá tomamos la columna de la fecha y la pusimos en un formato estándar (día-mes-año) para que coincidiera con el otro archivo.

Luego, teníamos otro archivo con los datos WEATHER. Hacemos lo mismo (día-mes-año).

Descartamos las columnas de fecha originales de ambos archivos después de crear nuestra columna de fecha estándar.

Una vez que ambos archivos tenían una columna de fecha en el mismo formato, los unimos con un merge de izquierda (tirando para SALES). O sea, para cada venta, intentamos encontrar la información del clima que ocurrió en ese mismo día. Si encontramos una coincidencia de fecha, agregamos las columnas del clima (como temperatura máxima, mínima, promedio y la estación del año) a la fila de esa venta de propiedad. 
