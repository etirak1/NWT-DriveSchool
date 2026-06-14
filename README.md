# NWT DriveSchool — Aplikacija za upravljanje auto-školom

Mikroservisna web aplikacija razvijena u sklopu predmeta NWT. Sadrži React frontend i Spring Boot backend servise.

## Tehnologije

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Spring Boot mikroservisi (Java 17)
- **Baza podataka:** MySQL 8.0
- **Message broker:** RabbitMQ
- **Service discovery:** Eureka Server
- **API Gateway:** Spring Cloud Gateway
- **Kontejnerizacija:** Docker + Docker Compose

## Servisi

| Servis | Port |
|---|---|
| Frontend (nginx) | 5173 |
| API Gateway | 8080 |
| User Service | 8081 |
| Resource Service | 8082 |
| Training & Scheduling Service | 8083 |
| Finance Service | 8084 |
| Eureka Server | 8761 |
| RabbitMQ Management | 15672 |

---

## Načini pokretanja

Aplikacija se može pokrenuti na dva načina: **Docker** (preporučeno) ili **lokalno** (za razvoj u IntelliJ).

---

## Opcija A — Docker (preporučeno)

### Preduvjeti

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instaliran i pokrenut
- Minimalno **6 GB RAM-a** dodijeljeno Dockeru (WSL2 backend)

### Postavljanje WSL2 memorije (samo Windows)

Ako Docker koristi WSL2 backend (vidi Docker Desktop → Settings → Resources), napravi ili uredi fajl .wslconfig`:
[wsl2]
memory=6GB
swap=2GB

Nakon toga restartuj WSL:

```bash
wsl --shutdown
```

## Pokretanje (Docker)

### 1. Kloniraj repozitorij

```bash
git clone <repo-url>
cd NWT-DriveSchool
```

### 2. Pokreni aplikaciju

```bash
docker-compose up -d
```

Docker će automatski:
- Pokrenuti MySQL i inicijalizovati baze podataka
- Pokrenuti RabbitMQ
- Pokrenuti Eureka Server
- Pokrenuti sve Spring Boot mikroservise
- Buildovati i pokrenuti React frontend

> **Napomena:** Prvo pokretanje traje duže jer se builduju Docker image-ovi. RabbitMQ treba oko 40–80 sekundi da se potpuno pokrene.

### 3. Provjeri status

```bash
docker ps
```

Svi containeri trebaju imati status `Up`. Sačekaj dok Spring Boot servisi ne završe inicijalizaciju (1–2 minute).

### 4. Otvori aplikaciju

**http://localhost:5173**

## Zaustavljanje (Docker)

```bash
docker-compose down
```

Za brisanje i podataka iz baze:

```bash
docker-compose down -v
```

---

## Opcija B — Lokalno pokretanje (IntelliJ + npm)

Pogodno za razvoj — servisi se pokreću direktno iz IDE-a, a MySQL i RabbitMQ rade kroz Docker.

### Preduvjeti

- [Java 17](https://adoptium.net/) instaliran
- [IntelliJ IDEA](https://www.jetbrains.com/idea/) (Community ili Ultimate)
- [Node.js 18+](https://nodejs.org/) i npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (samo za infrastrukturu)

### Korak 1 — Pokreni infrastrukturu (Docker)

Pokreni samo MySQL i RabbitMQ:

```bash
docker-compose up -d mysql rabbitmq
```

Sačekaj 15–20 sekundi da se MySQL inicijalizuje.

### Korak 2 — Pokreni Eureka Server u IntelliJ

1. Otvori projekt u IntelliJ: **File → Open** → odaberi folder `NWT-DriveSchool`
2. IntelliJ će automatski detektovati Maven module
3. Nađi i pokreni: `eureka-server/src/main/java/.../EurekaServerApplication.java`
4. Sačekaj dok se ne pojavi: `Started EurekaServerApplication`

### Korak 3 — Pokreni mikroservise u IntelliJ

Pokreni svaki servis u ovom redoslijedu (svaki u posebnom run/debug prozoru):

| Redoslijed | Main klasa |
|---|---|
| 1 | `eureka-server` → već pokrenut |
| 2 | `user-service` → `UserServiceApplication` |
| 3 | `resource-service` → `ResourceServiceApplication` |
| 4 | `finance-service` → `FinanceServiceApplication` |
| 5 | `training-and-scheduling-service` → `TrainingServiceApplication` |
| 6 | `gateway-service` → `GatewayServiceApplication` |

> **Savjet:** U IntelliJ možeš desnim klikom na main klasu → **Run** ili koristiti **Run Configurations** da pokreneš sve odjednom.

Svaki servis automatski kreira svoju bazu podataka pri prvom pokretanju.

### Korak 4 — Pokreni frontend

```bash
cd frontend
npm install
npm run dev
```

Aplikacija će biti dostupna na **http://localhost:5173**.

> Frontend u razvoju komunicira s gateway-om na `http://localhost:8080`. Provjeriti da je gateway pokrenut.

### Zaustavljanje (lokalno)

- Zaustavi sve servise u IntelliJ (crveni kvadrat u Run prozoru)
- Zaustavi infrastrukturu:

```bash
docker-compose down

### RabbitMQ je `unhealthy`

RabbitMQ ponekad treba više od 60 sekundi da se pokrene. Pokušati ponovo:

```bash
docker-compose down
docker-compose up -d
```

## Test nalozi

| Rola | Email | Lozinka |
|---|---|---|
| Admin |etirak1@autoskola.ba | 123456 |
| Instruktor | tljubovic@etf.unsa.ba | 123456 |

> Ako test nalozi ne postoje, dodati ih kroz admin panel nakon prvog pokretanja.
