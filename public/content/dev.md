/* ## SIDEBAR ## --------------------------------------------------------------------------------------------------------------------*/

<Sidebar>
<Logo>https://chargetrip.com/</Logo>
<Line>
</Sidebar>


/* ## BODY ## --------------------------------------------------------------------------------------------------------------------*/
<Body>

<Full>

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

</Full>

</Body>
