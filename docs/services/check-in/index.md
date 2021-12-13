# Check-in Service

The **check-in service** is responsible for the check-in process and boarding pass email generation.
The client may check in only some of the passengers for the specified PNR at a time, according to the given information in the request body.
The check-in process may fail if the given details do not match those in the existing PNR (e.g. name, date of birth, etc.).

> **Note:** The boarding passes will be sent by email once the process is complete, and will be accessible through the `GET /bookings/{pnrId}` endpoint of the **booking service** thereafter.

## API

| Link                       | Method | Endpoint           | Description | Login Required   |
|:--------------------------:|:------:| ------------------ | ----------- |:----------------:|
| [&#128279;](./check-in.md) | `POST` | `/checkIn/{pnrId}` | Check in    | &#10004;&#65039; |
