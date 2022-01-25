const res = [
    db.createCollection("pnrs", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: [
                    "passengers",
                    "flightId",
                    "contact",
                    "ticket",
                    "createdTimestamp"
                ],
                properties: {
                    _id: {
                        description: "Unique ID or record locator for this PNR represented by a standard UUIDv1 representation. (Required)",
                        bsonType: "binData"
                    },
                    passengers: {
                        description: "List of passengers details for this itinerary. (Required)",
                        bsonType: "array",
                        minItems: 1,
                        items: {
                            description: "Passenger details.",
                            bsonType: "object",
                            required: [
                                "givenNames",
                                "surname",
                                "dateOfBirth",
                                "gender"
                            ],
                            properties: {
                                nameTitle: {
                                    description: "Name title of the passenger, such as Mr, Mrs, etc.",
                                    bsonType: "string"
                                },
                                givenNames: {
                                    description: "Given names of the passenger (first name and middle names) as written in the passport. (Required)",
                                    bsonType: "string"
                                },
                                surname: {
                                    description: "Surname (or last name) of the passenger as written in passport. (Required)",
                                    bsonType: "string"
                                },
                                dateOfBirth: {
                                    description: "Date of birth of the passenger as written in the passport. (Required)",
                                    bsonType: "date"
                                },
                                gender: {
                                    description: "Gender of the passenger as written in the passport. (Required)",
                                    enum: [
                                        "male",
                                        "female",
                                        "other",
                                        "unspecified"
                                    ]
                                },
                                bookedSeatId: {
                                    description: "Booked seat ID of the passenger's seat in the flight in standard UUID format.",
                                    bsonType: "binData"
                                },
                                passport: {
                                    description: "Passport details for this passenger.",
                                    bsonType: "object",
                                    required: [
                                        "number",
                                        "expirationDate",
                                        "countryIssued"
                                    ],
                                    properties: {
                                        number: {
                                            description: "The passport number.",
                                            bsonType: "string"
                                        },
                                        expirationDate: {
                                            description: "The expiration date of the passport.",
                                            bsonType: "date"
                                        },
                                        countryIssued: {
                                            description: "The ISO 3166-1 alpha-2 country code of the country that issued this passport.",
                                            bsonType: "string",
                                            pattern: "^[A-Z]{2}$"
                                        }
                                    }
                                },
                                checkInTimestamp: {
                                    description: "Check-in timestamp for this passenger.",
                                    bsonType: "date"
                                },
                                boardingTimestamp: {
                                    description: "Plane boarding timestamp for this passenger.",
                                    bsonType: "date"
                                }
                            }
                        }
                    },
                    flightId: {
                        description: "Flight ID of the flight the booking was made for in standard UUID format. (Required)",
                        bsonType: "binData"
                    },
                    contact: {
                        description: "Contact details of the person who made the booking. (Required)",
                        bsonType: "object",
                        required: [
                            "firstName",
                            "surname",
                            "email",
                            "phone",
                            "address"
                        ],
                        properties: {
                            firstName: {
                                description: "First name of the person who made the booking. (Required)",
                                bsonType: "string"
                            },
                            surname: {
                                description: "Surname (or last name) of the person who made the booking. (Required)",
                                bsonType: "string"
                            },
                            email: {
                                description: "Email address. (Required)",
                                bsonType: "string"
                            },
                            phone: {
                                description: "International phone number. (Required)",
                                bsonType: "string"
                            },
                            address: {
                                description: "Address of the person who made the booking. (Required)",
                                bsonType: "object",
                                required: [
                                    "countryCode",
                                    "city",
                                    "street",
                                    "houseNumber",
                                    "postalCode"
                                ],
                                properties: {
                                    countryCode: {
                                        description: "ISO 3166-1 alpha-2 country code. (Required)",
                                        bsonType: "string",
                                        pattern: "^[A-Z]{2}$"
                                    },
                                    subdivisionCode: {
                                        description: "ISO 3166-2 subdivision code.",
                                        bsonType: "string",
                                        pattern: "^[A-Z]{2}-[A-Z0-9]{1,3}$"
                                    },
                                    city: {
                                        description: "City name. (Required)",
                                        bsonType: "string"
                                    },
                                    street: {
                                        description: "Street name. (Required)",
                                        bsonType: "string"
                                    },
                                    houseNumber: {
                                        description: "House number. (Required)",
                                        bsonType: "string"
                                    },
                                    postalCode: {
                                        description: "Postal code. (Required)",
                                        bsonType: "string"
                                    }
                                }
                            }
                        }
                    },
                    ticket: {
                        description: "Information about the ticketing status of this PNR. (Required)",
                        bsonType: "object",
                        required: [
                            "status"
                        ],
                        properties: {
                            status: {
                                description: "Status of the ticket to be issued for this PNR. (Required)",
                                enum: [
                                    "pending",
                                    "issued",
                                    "canceled"
                                ]
                            },
                            issueTimestamp: {
                                description: "Timestamp of the time a ticket has been issued for this PNR.",
                                bsonType: "date"
                            }
                        }
                    },
                    createdTimestamp: {
                        description: "The timestamp on which this PNR has been created. (Required)",
                        bsonType: "date"
                    },
                    updatesTimestamps: {
                        description: "List of the timestamps on which this PNR has been updated.",
                        bsonType: "array",
                        items: {
                            description: "Updates timestamp",
                            bsonType: "date"
                        }
                    },
                    cancelTimestamp: {
                        description: "Timestamp on which this booking (PNR) has been canceled.",
                        bsonType: "date"
                    }
                }
            }
        }
    }),
    db.pnrs.insertOne(
        {
            _id: UUID("eb2e5080-000e-440d-8242-46428e577ce5"),
            passengers: [
                {
                    nameTitle: "Mr",
                    givenNames: "John Albert",
                    surname: "Doe",
                    dateOfBirth: new Date("2000-01-01T00:00:00.000Z"),
                    gender: "male"
                },
                {
                    nameTitle: "Mrs",
                    givenNames: "Jane",
                    surname: "Doe",
                    dateOfBirth: new Date("2002-01-01T00:00:00.000Z"),
                    gender: "female"
                }
            ],
            flightId: UUID("17564e2f-7d32-4d4a-9d99-27ccd768fb7d"),
            contact: {
                firstName: "John",
                surname: "Doe",
                email: "john.doe@example.com",
                phone: "+972541234567",
                address: {
                    countryCode: "IL",
                    city: "Tel Aviv-Yafo",
                    street: "Shlomo Rd.",
                    houseNumber: "136",
                    postalCode: "6603248"
                }
            },
            ticket: {
                status: "pending",
            },
            createdTimestamp: new Date("2020-10-10T14:23:05.659711Z"),
        }
    )
];

printjson(res);
