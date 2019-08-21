/* ## SIDEBAR ## --------------------------------------------------------------------------------------------------------------------*/

<Sidebar>
<Logo>https://chargetrip.com/</Logo>
<Line>
</Sidebar>


/* ## BODY ## --------------------------------------------------------------------------------------------------------------------*/
<Body>

<Full>

<Example>
mutation addLocation {
addUserLocation(
location: {
name: generateString(15)
address: generateString(15)
location: {
type:Point
coordinates: [generateInt(20 true), generateInt(5 true), generateFloat(2 6 true), generateFloat(2 6 true)]
}
}) {
id
}
}
</Example>

</Full>

</Body>
