/* Introduction -------------------------------------------------------------------------------------------------- */

# Introduction

The Chargetrip API enables you to develop navigation tools for electric vehicles. You can use this API to produce routes between various locations conforming to a wide variety of parameters. You can also use it to retrieve and modify information about individual users on your platform, electric vehicles, stations and their operators, and much more.

### About this Documentation

This documentation is organized into seven sections. The first section [Getting Started](#getting-started) gives a simple overview of the API and its features with examples. The next five sections [Routing](#routing), [Stations](#stations), [Cars](#cars), [Users](#users), and [Operators](#operators) contain more detailed information about the primary features of the API and how to use them sorted by category. The final section [API Reference](#api-reference) contains a complete reference for every operation, enumerator, and object available to clients through the API.

### Getting Started

The Chargetrip API is built around [GraphQL](https://graphql.org/). If you aren't familiar with GraphQL, going over the [specs](https://graphql.github.io/graphql-spec/) would be helpful, though you probably won't need to have read them in their entirety to understand the basics of the API. For those unfamiliar with GraphQL or our API, this [Getting Started Guide](/?page=getting-started) coveres the basics of both, and might also be a good place to start.

/* Routing ------------------------------------------------------------------------------------------------------ */

# Routing

The primary feature of the Chargetrip API is routing. A Route:

<Type printHeader=false printDescriptions=false>Route</Type>

is used to access a route.

## Retrieving or Modifying Route Data

There are several operators that are used to create and access routes. The `newRoute` mutation is used to create a route. It takes a `RequestInput` input object which contains all the parameters needed to create a route and returns the ID of a newly created Route. The `route` query is used to access a given Route by its ID. A Route will include both a primary route and a list of alternate routes (when available) which are stored as `RouteAlternative` objects. The `routeUpdatedByID` subscription is triggered whenever a specific Route is updated by the system.

<OperationTable include=[route routealternative]>Operation</OperationTable>

#### Example 1: Make a New Route

<Example>mutation newRoute {
newRoute(input: {
ev:{
id: "5ca4a846d858562d772944b0"
battery:{
capacity:28
stateOfCharge:{
value: 25
type:kwh
}
finalStateOfCharge:{
value:0
type:kwh
}
}
plugs:[{
type: ccs
chargingPower: 40
},
{
type: type2
chargingPower: 22
}]
minPower:40
climate:false
numberOfPassengers:1
}
routeRequest: {
origin: {
type: Feature
geometry:{
type: Point
coordinates: [10.7389701,59.9133301]
}
properties: {
addess:"0026 Oslo, Norway"
}
}
destination:{
type:Feature
geometry: {
type:Point
coordinates:[7.966368380115114,58.14040107717675]
}
properties:{
addess: "E 39, 4613 Kristiansand, Norway"
}
}
}
}
)
}</Example>

#### Example 2: Subscribe to a Route's Updates.

<Example>subscription getUpdates {
routeUpdatedById(id: "INSERT_ROUTE_ID_HERE") {
status
}
}</Example>

#### Example 3: Query a Newly Created Route.

<Example>query getRoute {
route(id:"INSERT ROUTE ID HERE") {
status
route {
id
type
charges
distance
duration
consumption
amenityRanking
legs {
distance
duration
consumption
origin {
type
geometry {
type
coordinates
}
properties
}
destination {
type
geometry {
type
coordinates
}
properties
}
type
name
stationId
operatorId
chargeTime
evse {
externalId
connectors {
type
power
status
}
}
}
saving {
co2
money
currency
averageGasPrice
averageEnergyPrice
}
via
}
}
}</Example>

/* Stations ----------------------------------------------------------------------------------------------------------------------- */


# Stations

A Station:

<Type printHeader=false printDescriptions=false>Station</Type>

is used to represent and access information on individual charging stations. Each instance of the Station type contains all the information for a particular station.

## Retrieving Station Data

There are a number of queries that can be used to access different information about stations. `station` and `reviewList` take a station ID and produce information about that particular station while `stationList` and `stationAround` produce a list of stations according to given parameters.

<OperationTable include=[station review reviewadd reviewedit]>Query</OperationTable>

#### Example: Get Information About the Station(s) Nearest a Specific Point

<Example>query nearbyStations {
stationAround(
query: {
location: {
type:Point
coordinates:[9.07368, 58.82081]
}
distance:5000
power: [50, 22]
amenities: ["supermarket"]
}
size: 1
page: 0
) {
id
externalId
name
location {
type
coordinates
}
elevation
evses {
externalId
evseId
physicalReference
connectors {
externalId
ocpiId
power
amps
voltage
type
status
properties
}
parkingRestriction
properties
paymentMethod
price {
value
currency
model
displayValue
}
}
chargers {
type
power
price
speed
status {
free
busy
error
unknown
}
total
}
operator {
id
name
}
owner {
id
name
}
address {
continent
county
city
street
number
postalCode
what3Words
formattedAddress
}
amenities
properties
realtime
private
open24h
timezone
lastUsedDate
power
speed
status
createdAt
updatedAt
}
}</Example>

## Modifying a Station's Reviews

While clients are not permitted to modify station data, it is possible for users to add reviews to a station. A Review:

<Type printHeader=false printDescriptions=false>Station</Type>

is used to represent a single review for a specific station. `addReview` adds a review from the logged in user to a given station while `updateReview` and `removeReview` modify a review added by the logged in user.

<OperationTable include=[station review reviewadd reviewedit]>Mutation</OperationTable>

#### Example: Add a Review to a Station

<Example autoformat=true>
mutation addR {
  addReview(
    review: {
        stationId:"~INSERT_STATION_ID_HERE~"
        rating: 5
        message: generateString(20)
        locale: generateString(20)
      ev: generateString(10)
    }
  ) {
    id
  }
}
</Example>

## Station Related Subscriptions

There are several subscriptions relating to the Station type:

<OperationTable include=[station review reviewadd reviewedit]>Subscription</OperationTable>


/* Cars --------------------------------------------------------------------------------------------------------------------------- */

# Cars

A Car:

<Type printDescriptions=false printHeader=false>Car</Type>

is used to represent and access information on individual types of cars within the system. Each instance of the Car type contains all information about that particular type of car. Cars can not be modified by clients. However, which cars' information a client has access to will depend on the client. Note: Cars should not be confused with UserCars, which references Car and represents a specific user's car.

## Retrieving Car Data

Several operations can be used to retrieve data on cars if you have access to them. `car` produces the data for a specific car given its ID, while `carList` produces data on a list of cars up to the full list of cars.

<OperationTable include=[car caradd caredit] exclude=[usercar usercaradd usercaredit]>Operation</OperationTable>

#### Example: Get Information on a List of Cars

<Example>
query carListQ {
  carList(
    size: 3
    page: 0
  )
  {
    id
    make
    carModel
  }
}</Example>

/* Users -------------------------------------------------------------------------------------------------------------------------- */

# Users

A User:

<Type printDescriptions=false printHeader=false>User</Type>

is used to represent and access information on individual users of the platform. Each instance of the User type contains all the information for a particular user.

## Retrieving User Data

Several queries can be used to access information about a user. `user` and `userReviewList` both produce information about the user that is currently logged in, while the rest produce information about a user after entering their ID.

<OperationTable include=[user usercar userlocation userinput usercarinput userlocationinput]>Query</OperationTable>

#### Example: Return The Logged In User's Information

<Example>query userQ {
user {
id
externalId
email
firstName
lastName
properties
phone
roles
}
}</Example>

## Modifying User Data

There are several mutations that can be used to add, delete, or modify a user's information, all of which can alter only the logged in user's information.

<OperationTable include=[user usercar userlocation userinput usercarinput userlocationinput]>Mutation</OperationTable>

#### Example: Add a Location for the Logged in User

<Example>mutation addLocation {
addUserLocation(
location: {
name: generateString(15)
address: generateString(15)
location: {
type:Point
coordinates: [generateFloat(2 6 true), generateFloat(2 6 true)]
}
}) {
id
}
}</Example>


## User Related Subscriptions

There are many subscriptions related to the User type. Subscriptions are long-lived requests that fetch data in response to source events, and are mainly used by the system.

<OperationTable include=[user usercar userlocation userinput usercarinput userlocationinput]>Subscription</OperationTable>


/* Operators ---------------------------------------------------------------------------------------------------------------------- */

# Operators
An Operator:

<Type printDescriptions=false printHeader=false>User</Type>

is used to represent and access information on the operator of a station.

## Retrieving Operator Data

There are several queries that can be used to access information on operators. `operator` retrieves information on an operator using its ID while `operatorList` retrieves information on a list of operators up to the full list of operators. There are also a number of subscriptions relating to operators:

<OperationTable include=[operator operatoredit operatoradd]>Operation</OperationTable>

</Left

#### Example: Get All Information on a Single Operator

<Example>query getOperator {
operator(id:"5c58134a9f94fa3b975b916f") {
id
externalId
name
country
contact {
phone
email
website
facebook
twitter
properties
}
createdAt
updatedAt
}
}</Example>

/* API Reference ------------------------------------------------------------------------------------------------------------------ */

# API Reference

The following is a list of all operations, enumerators, and objects available in the API.

For an interactive reference, head to the [playground](https://playground.chargetrip.io/graphQL) and click on the "schema" tab.

/* Reference Subheadings ---------------------------------------------------------------------------------------------------------- */

## Queries

<OperationTable>Query</OperationTable>

## Mutations

<OperationTable>Mutation</OperationTable>

## Subscriptions

<OperationTable>Subscription</OperationTable>

## Types

<TypeList>Object</TypeList>

## Inputs

<TypeList>Input_Object</TypeList>

## Enumerators

<TypeList printDescriptions=false>Enum</TypeList>

/* Additional Information --------------------------------------------------------------------------------------------------------- */

# Additional Information

For more information about the API, go to the [playground](https://playground.chargetrip.io/graphQL), and click on Schema to view information on all operations and objects.

For more information about Chargetrip go to [chargetrip.com](https://chargetrip.com/).