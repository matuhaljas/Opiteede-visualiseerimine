# tlu_opiteed projekt

Spring Boot rakendus TLU õpiteede haldamiseks.

## Struktuur

```
opiteede_projekt/
└── tlu_opiteed/          # Spring Boot mooduli juur
    ├── pom.xml
    └── src/
        ├── main/
        │   ├── java/ee/opiteed/tlu_opiteed/
        │   └── resources/application.properties
        └── test/java/ee/opiteed/tlu_opiteed/
```

## Stack

- **Java 21**
- **Spring Boot 4.0.6**
- Spring Data JPA
- Spring Web MVC
- H2 (arendus) + PostgreSQL (tootmine)
- Lombok
- Maven (wrapper: `mvnw`)

## Käivitamine

```powershell
cd tlu_opiteed
.\mvnw.cmd spring-boot:run
```

## Build & testid

```powershell
cd tlu_opiteed
.\mvnw.cmd clean package
.\mvnw.cmd test
```

## Põhiklass

`tlu_opiteed/src/main/java/ee/opiteed/tlu_opiteed/TluOpiteedApplication.java`

## Märkused

- `application.properties` on praegu minimaalne (ainult rakenduse nimi)
- H2 konsooli tugi on lisatud sõltuvusena
- Uued entity-d, repository-d ja kontrollerid käivad paketti `ee.opiteed.tlu_opiteed`
