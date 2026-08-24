# FullBody Pro - Registro y Progresión de Entrenamiento

Aplicación web progresiva (PWA) de entrenamiento Full-Body de 3 días (Lunes, Miércoles, Viernes) con cálculo de 1RM, volumen de carga, temporizadores de descanso inteligentes, seguimiento de peso y medidas corporales (pecho, bíceps, abdomen), e importación/exportación de datos sin servidores externos.

---

## 🚀 Despliegue Automático en GitHub Pages (Enlace Público)

Esta aplicación incluye un flujo de trabajo automatizado con **GitHub Actions** (`.github/workflows/deploy.yml`) para compilar y publicar la app automáticamente en **GitHub Pages** cada vez que hagas un `push` a la rama `main` o `master`.

### Pasos para activar tu enlace público en GitHub:

1. **Sube el código a tu repositorio de GitHub**:
   - Puedes exportar el proyecto a GitHub desde el menú superior de Google AI Studio o mediante Git:
     ```bash
     git add .
     git commit -m "FullBody Pro con GitHub Actions"
     git push origin main
     ```

2. **Activar GitHub Pages en el repositorio**:
   - Entra a tu repositorio en GitHub.
   - Ve a **Settings** (Configuración) > **Pages** (en el menú lateral izquierdo).
   - En la sección **Build and deployment** > **Source**, selecciona:
     👉 **GitHub Actions** (en lugar de "Deploy from a branch").

3. **¡Listo! Tu enlace público estará disponible en**:
   ```
   https://<tu-usuario>.github.io/<nombre-de-tu-repositorio>/
   ```
   *GitHub Actions compilará automáticamente el proyecto y te proporcionará la URL pública activa.*

---

## ✨ Características Principales

- 🏋️‍♂️ **Plan Full-Body de 3 Días**: Distribución optimizada para 30-45 minutos con ejercicios compuestos y accesorios.
- ⏱️ **Temporizador de Descanso Inteligente**: Alertas de sonido, vibración y cuenta atrás visual con preajustes de 60s, 90s, 120s y 180s.
- 📊 **Cálculo de Progresión & PRs**: Estimación de 1RM (Epley/Brzycki) y volumen total por sesión.
- ⚖️ **Control de Peso y Medidas**: Registro continuo de peso corporal, contorno de pecho, bíceps y abdomen con gráficas de evolución.
- 💾 **Exportar e Importar**: Respaldos completos en archivos `.json` estructurados y hojas de cálculo `.csv`.
- 📱 **Instalable (PWA)**: Funciona en móviles y ordenadores con soporte offline y sin necesidad de base de datos externa.

---

## 🛠️ Comandos de Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar compilación local
npm run preview
```
