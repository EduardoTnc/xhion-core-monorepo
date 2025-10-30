# 📊 Diagramas de Despliegue - XHION CORE

**Fecha:** 30 de Octubre, 2025  
**Versión:** 1.0  
**Estado:** ✅ Completado

---

## 📁 Archivos Incluidos

### **1. XHION-CORE-AWS-SERVERLESS.plantuml**
Diagrama de despliegue para arquitectura **AWS Serverless** completa.

### **2. XHION-CORE-CONTABO-VPS.plantuml**
Diagrama de despliegue para **Contabo VPS** con Docker.

---

## 🚀 OPCIÓN 1: AWS Serverless

### **Arquitectura:**
```
Cliente → CloudFront (CDN) → S3 (Frontend)
                          ↓
                    API Gateway → Lambda Functions → RDS Aurora
                                                  ↓
                                              DynamoDB (WebSocket)
```

### **Componentes Principales:**

#### **Frontend:**
- **AWS S3:** Almacenamiento de archivos estáticos
- **AWS CloudFront:** CDN global con 200+ edge locations
- **Características:**
  - Latencia < 50ms global
  - SSL/TLS automático
  - Compresión Gzip/Brotli
  - Cache inteligente

#### **Backend:**
- **AWS Lambda:** Funciones serverless (Node.js 20.x)
- **API Gateway:** REST API + WebSocket API
- **Características:**
  - Auto-scaling infinito
  - Pay per invocation
  - 0 mantenimiento de servidores
  - JWT Authorizer integrado

#### **Base de Datos:**
- **AWS RDS Aurora Serverless:** PostgreSQL 15
- **Características:**
  - Auto-scaling: 0.5-16 ACU
  - Auto-pause cuando inactivo
  - Backup automático
  - Ahorro del 70% vs RDS tradicional

#### **Real-time:**
- **API Gateway WebSocket API:** Conexiones WebSocket
- **AWS DynamoDB:** Almacenamiento de conexiones activas
- **Características:**
  - Latencia < 10ms
  - Escalado automático
  - TTL automático (24h)

#### **Almacenamiento:**
- **AWS S3:** Uploads (avatares, documentos, archivos)
- **Características:**
  - Lifecycle policies
  - Versionado
  - Encriptación SSE-S3

#### **Seguridad:**
- **AWS IAM:** Roles y políticas
- **AWS Secrets Manager:** Gestión de secretos
- **CloudFront:** DDoS protection

#### **Monitoreo:**
- **AWS CloudWatch:** Logs, métricas, alarmas
- **Características:**
  - Logs centralizados
  - Métricas en tiempo real
  - Alertas automáticas

---

### **Costos Estimados AWS:**

#### **Producción (1000 usuarios activos/día):**
| Servicio | Costo Mensual |
|----------|---------------|
| CloudFront | $50-100 |
| S3 (Frontend) | $5-10 |
| Lambda | $20-50 |
| API Gateway | $15-30 |
| RDS Aurora Serverless | $30-80 |
| DynamoDB | $10-25 |
| S3 (Uploads) | $5-15 |
| CloudWatch | $5-10 |
| **TOTAL** | **$140-320/mes** |

#### **Desarrollo (Free Tier - 12 meses):**
| Servicio | Free Tier |
|----------|-----------|
| CloudFront | 1TB/mes |
| S3 | 5GB storage |
| Lambda | 1M requests/mes |
| API Gateway | 1M requests/mes |
| RDS Aurora | No free tier |
| DynamoDB | 25GB storage |
| **Costo Estimado** | **$20-40/mes** |

---

### **Ventajas AWS Serverless:**
- ✅ **Escalado automático infinito**
- ✅ **Alta disponibilidad (99.99%)**
- ✅ **Bajo mantenimiento**
- ✅ **Pago por uso real**
- ✅ **Seguridad gestionada**
- ✅ **Global desde día 1**
- ✅ **Backup automático**

### **Desventajas AWS Serverless:**
- ❌ **Costo variable (puede aumentar)**
- ❌ **Vendor lock-in**
- ❌ **Cold start en Lambda (~1s)**
- ❌ **Complejidad inicial**
- ❌ **Debugging más difícil**

---

## 🖥️ OPCIÓN 2: Contabo VPS

### **Arquitectura:**
```
Cliente → Cloudflare (CDN) → NGINX → Docker Containers
                                    ↓
                              Frontend (NGINX)
                              Backend (NestJS)
                              PostgreSQL
                              Redis
```

### **Componentes Principales:**

#### **Servidor:**
- **Contabo VPS Cloud M:**
  - 8 vCPU Cores
  - 16 GB RAM
  - 400 GB SSD
  - 32 TB Traffic
  - **Costo: €8.99/mes (~$9.50)**

#### **Reverse Proxy:**
- **NGINX:**
  - SSL/TLS (Let's Encrypt)
  - Gzip compression
  - Rate limiting
  - Static file serving
  - WebSocket proxy

#### **Containers (Docker):**

1. **Frontend Container:**
   - NGINX Alpine
   - React build output
   - Port: 8080

2. **Backend Container:**
   - Node.js 20 Alpine
   - NestJS + Prisma
   - WebSocket server
   - Port: 3000

3. **PostgreSQL Container:**
   - PostgreSQL 15 Alpine
   - Persistent volume
   - Port: 5432

4. **Redis Container:**
   - Redis 7 Alpine
   - Cache + Sessions
   - Port: 6379

#### **CDN (Opcional):**
- **Cloudflare Free:**
  - CDN global
  - DDoS protection
  - SSL gratuito
  - WAF (Web Application Firewall)

#### **Almacenamiento Externo (Opcional):**
- **Backblaze B2 / AWS S3:**
  - Uploads de usuarios
  - Backups de base de datos
  - Costo: ~$5-10/mes

#### **Seguridad:**
- **UFW Firewall:** Solo puertos 22, 80, 443
- **Fail2Ban:** Protección brute force
- **Let's Encrypt:** SSL/TLS gratuito
- **Docker Network:** Aislamiento de containers

#### **Backup:**
- **PostgreSQL Dumps:** Diarios (2:00 AM)
- **Volume Snapshots:** Semanales
- **Offsite Backup:** Backblaze B2
- **Retención:** 30 días

---

### **Costos Estimados Contabo:**

#### **Configuración Básica:**
| Servicio | Costo Mensual |
|----------|---------------|
| Contabo VPS M | $9.50 |
| Cloudflare | $0 (Free) |
| Domain | $1 (promedio) |
| **TOTAL** | **$10.50/mes** |

#### **Configuración Completa:**
| Servicio | Costo Mensual |
|----------|---------------|
| Contabo VPS M | $9.50 |
| Cloudflare | $0 (Free) |
| Domain | $1 |
| Backblaze B2 | $5-10 |
| **TOTAL** | **$15.50-20.50/mes** |

---

### **Ventajas Contabo VPS:**
- ✅ **Costo predecible (~$10/mes)**
- ✅ **Control total del servidor**
- ✅ **Sin límites de requests**
- ✅ **Recursos dedicados**
- ✅ **Fácil de debuggear**
- ✅ **Sin vendor lock-in**
- ✅ **Migración sencilla**

### **Desventajas Contabo VPS:**
- ❌ **Requiere mantenimiento**
- ❌ **Escalado manual**
- ❌ **Single point of failure**
- ❌ **Backup manual**
- ❌ **Seguridad manual**
- ❌ **No auto-scaling**

---

## 📊 Comparación Directa

| Característica | AWS Serverless | Contabo VPS |
|----------------|----------------|-------------|
| **Costo Inicial** | $20-40/mes (Free Tier) | $10/mes |
| **Costo Producción** | $140-320/mes | $10-20/mes |
| **Escalabilidad** | ✅ Automática infinita | ⚠️ Manual (hasta límite VPS) |
| **Mantenimiento** | ✅ Mínimo | ❌ Alto |
| **Disponibilidad** | ✅ 99.99% | ⚠️ 99.9% |
| **Latencia Global** | ✅ < 50ms | ⚠️ Depende ubicación |
| **Setup Inicial** | ⚠️ Complejo | ✅ Simple |
| **Debugging** | ❌ Difícil | ✅ Fácil |
| **Vendor Lock-in** | ❌ Alto | ✅ Ninguno |
| **Control** | ⚠️ Limitado | ✅ Total |

---

## 🎯 Recomendaciones

### **Usar AWS Serverless si:**
- ✅ Esperas crecimiento rápido e impredecible
- ✅ Necesitas presencia global desde día 1
- ✅ Quieres mínimo mantenimiento
- ✅ El presupuesto es flexible
- ✅ Priorizas alta disponibilidad
- ✅ Tienes experiencia con AWS

### **Usar Contabo VPS si:**
- ✅ Presupuesto limitado (~$10/mes)
- ✅ Crecimiento predecible
- ✅ Audiencia regional/local
- ✅ Quieres control total
- ✅ Tienes experiencia con Linux/Docker
- ✅ Prefieres costos fijos

---

## 🚀 Estrategia Híbrida (Recomendada)

### **Fase 1: Desarrollo (Contabo VPS)**
- Costo: $10/mes
- Aprender y validar producto
- Iteración rápida

### **Fase 2: Crecimiento (Contabo VPS + Cloudflare)**
- Costo: $15-20/mes
- Agregar CDN y seguridad
- Optimizar performance

### **Fase 3: Escala (Migrar a AWS Serverless)**
- Costo: $140-320/mes
- Cuando > 5000 usuarios activos
- Cuando necesites auto-scaling
- Cuando el costo VPS sea limitante

---

## 📝 Comandos Útiles

### **Generar Diagramas PlantUML:**

```bash
# Instalar PlantUML
npm install -g node-plantuml

# Generar PNG
plantuml XHION-CORE-AWS-SERVERLESS.plantuml
plantuml XHION-CORE-CONTABO-VPS.plantuml

# Generar SVG
plantuml -tsvg XHION-CORE-AWS-SERVERLESS.plantuml
plantuml -tsvg XHION-CORE-CONTABO-VPS.plantuml
```

### **Despliegue Contabo VPS:**

```bash
# Conectar al VPS
ssh root@your-vps-ip

# Clonar repositorio
git clone https://github.com/your-repo/xhion-core.git
cd xhion-core

# Configurar variables de entorno
cp .env.example .env
nano .env

# Iniciar con Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f

# Verificar estado
docker-compose ps
```

### **Despliegue AWS Serverless:**

```bash
# Instalar Serverless Framework
npm install -g serverless

# Configurar AWS credentials
aws configure

# Desplegar backend
cd xhion-core-api
serverless deploy --stage production

# Desplegar frontend
cd xhion-core-client
npm run build
aws s3 sync dist/ s3://xhion-core-frontend
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

---

## 📚 Recursos Adicionales

### **AWS:**
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [RDS Aurora Serverless](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless.html)
- [Serverless Framework](https://www.serverless.com/)

### **Contabo:**
- [Contabo VPS Plans](https://contabo.com/en/vps/)
- [Docker Documentation](https://docs.docker.com/)
- [NGINX Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

### **General:**
- [PlantUML Documentation](https://plantuml.com/)
- [Cloudflare Free Plan](https://www.cloudflare.com/plans/free/)
- [Backblaze B2](https://www.backblaze.com/b2/cloud-storage.html)

---

## ✅ Conclusión

Ambas arquitecturas son válidas y funcionales. La elección depende de:

1. **Presupuesto:** Contabo es más económico inicialmente
2. **Escala:** AWS es mejor para crecimiento rápido
3. **Experiencia:** Contabo es más simple para empezar
4. **Mantenimiento:** AWS requiere menos mantenimiento
5. **Control:** Contabo ofrece más control

**Recomendación:** Empezar con **Contabo VPS** para validar el producto y migrar a **AWS Serverless** cuando el crecimiento lo justifique.

---

**Última actualización:** 30 de Octubre, 2025  
**Autor:** Eduardo Tanca  
**Versión:** 1.0
