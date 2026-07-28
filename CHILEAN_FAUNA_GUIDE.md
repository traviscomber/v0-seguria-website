# SegurIA Vision - Fauna Chilena Soportada

## Descripción General

SegurIA Vision está entrenada para reconocer y clasificar la fauna nativa de Chile, optimizada para operaciones de seguridad en instalaciones que trabajen con animales silvestres.

## Especies Reconocidas

### Grandes Fauna (Megafauna)

| Especie | Nombres Alternativos | Clasificación | Estado |
|---------|-------------------|-----------------|--------|
| **Puma** | Cougar, Mountain Lion, León | Carnívoro Apex | Nativo, Protegido |
| **Huemul** | Andean Deer, Venado Andino | Herbívoro | En Peligro |
| **Guanaco** | Guanaca | Herbívoro | Nativo |
| **Vicuña** | Vicuna | Herbívoro | Amenazada |
| **Ñandú** | Rhea | Herbívoro Volador | Nativo |

### Fauna Mediana

| Especie | Nombres Alternativos | Clasificación | Observaciones |
|---------|-------------------|-----------------|--------|
| **Pudu** | Dwarf Deer, Northern Pudu | Herbívoro Pequeño | El ciervo más pequeño |
| **Culpeo** | Andean Fox, Culpeo Fox | Carnívoro | Nativo |
| **Zorro Chilla** | Chilla Fox | Carnívoro | Depredador Pequeño |
| **Zorro Gris Chileno** | Grey Fox Chilean | Carnívoro | Nativo |
| **Gato Montés** | Wildcat | Carnívoro | Felino Nativo |
| **Coipu** | Nutria | Roedor Acuático | Invasor, Control Recomendado |

### Fauna Pequeña

| Especie | Nombres Alternativos | Tipo | Nota |
|---------|-------------------|------|------|
| **Chinchilla** | Chinchilla chilena | Roedor | Nativa, Protegida |
| **Vizcacha** | Vizcacha | Roedor | Nativa |

### Fauna Común (No-Silvestre)

- **Livestock** (Ganado): Vacas, Caballos, Ovejas, Cabras, Cerdos, Alpacas, Llamas
- **Animales Domésticos**: Perros, Gatos
- **Otros**: Personas, Vehículos

## Casos de Uso

### Operaciones de Seguridad en Ganadería
Detectar depredadores (Puma, Culpeo) cerca del ganado y alertar automáticamente.

### Conservación de Fauna Protegida
Monitorear Huemul, Vicuña, y Chinchilla en áreas protegidas.

### Control de Especies Invasoras
Identificar Coipu y tomar acciones de control.

### Investigación Ecológica
Registrar avistamientos de fauna silvestre para estudios poblacionales.

## Confiabilidad

- **Alta Confianza (>85%)**: Puma, Huemul, Guanaco, Ñandú, Ganado
- **Confianza Media (70-85%)**: Pudu, Culpeo, Zorro Chilla, Gato Montés
- **Baja Confianza (<70%)**: Chinchilla, Vizcacha (tamaño muy pequeño dificulta detección)

## Limitaciones

1. **Tamaño**: Animales pequeños (Pudu, Chinchilla) requieren primeros planos claros
2. **Oclusión**: Fauna parcialmente oculta por vegetación puede no detectarse
3. **Luz**: Condiciones de poca luz reducen precisión
4. **Movimiento**: Imágenes borrosas afectan confiabilidad
5. **Especies Raras**: Avistamientos muy infrecuentes pueden tener menor precisión

## Mejoras Futuras

- [ ] Integrar cámaras de monitoreo continuo
- [ ] Machine Learning local (ONNX) para operaciones sin conexión
- [ ] Predicción de trayectorias de fauna
- [ ] Alertas automáticas por especie
- [ ] Base de datos de avistamientos históricos
