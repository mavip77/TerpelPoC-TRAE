# SMS Service (Spring Boot + Twilio)

## Requisitos

- Java 11+
- Maven 3.8+
- Cuenta de Twilio (Account SID, Auth Token)

## Configuración

Defina las credenciales de Twilio como variables de entorno o en `application.properties`:

```
twilio.accountSid=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXX
twilio.authToken=your_auth_token
twilio.fromNumber=+1XXXXXXXXXX
```

> No comparta estos valores en el repositorio.

## Ejecutar pruebas

```
mvn -q -f backend/sms-service/pom.xml test
```

## Construir y ejecutar

```
mvn -q -f backend/sms-service/pom.xml -DskipTests package
mvn -q -f backend/sms-service/pom.xml spring-boot:run
```

El servicio arrancará en `http://localhost:8080`.

## Endpoints

- `POST /api/sms/payment`

Ejemplo:

```
curl -i -X POST http://localhost:8080/api/sms/payment \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "+573000000000",
    "amount": 20000,
    "station": "Estación A",
    "ref": "ABC123",
    "status": "Aceptado",
    "hasData": false,
    "pushDelivered": false,
    "message": "Pago exitoso por $20.000 en Terpel Estación A. Ref: ABC123."
  }'
```

- `POST /api/sms/security`

Ejemplo:

```
curl -i -X POST http://localhost:8080/api/sms/security \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "+573000000000",
    "userId": "user-1",
    "deviceId": "dev-2",
    "knownDeviceIds": ["dev-1"],
    "hasData": false,
    "pushDelivered": false,
    "message": "Alerta seguridad: inicio de sesión desde dispositivo nuevo. ID: dev-2."
  }'
```

## Integración Frontend

- Android emulador: `http://10.0.2.2:8080`
- iOS simulador: `http://localhost:8080`

El servicio frontend ya llama estos endpoints desde `src/services/sms.ts`.
